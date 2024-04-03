/*
 * Copyright (c) 2024 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.ehr_billing.pipeline;

import org.apache.commons.lang3.time.DateUtils;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableResultSet;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr_billing.pipeline.BillingPipelineJobProcess;
import org.labkey.api.ehr_billing.pipeline.BillingPipelineJobSupport;
import org.labkey.api.ehr_billing.pipeline.InvoicedItemsProcessingService;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.pipeline.AbstractTaskFactory;
import org.labkey.api.pipeline.AbstractTaskFactorySettings;
import org.labkey.api.pipeline.PipelineJob;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.pipeline.RecordedAction;
import org.labkey.api.pipeline.RecordedActionSet;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.FileType;
import org.labkey.api.util.GUID;
import org.labkey.api.util.Pair;
import org.labkey.ehr_billing.EHR_BillingManager;
import org.labkey.ehr_billing.EHR_BillingSchema;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * A pipeline job task to generate Invoiced Items and Invoice Run for a given billing period.
 * Set as a task property in ehr_billingContext.xml.
 */
public class BillingTask extends PipelineJob.Task<BillingTask.Factory>
{
    private final static DbSchema EHR_BILLING_SCHEMA = EHR_BillingSchema.getInstance().getSchema();
    private final static InvoicedItemsProcessingService processingService =  InvoicedItemsProcessingService.get();

    protected BillingTask(Factory factory, PipelineJob job)
    {
        super(factory, job);
    }

    public static class Factory extends AbstractTaskFactory<AbstractTaskFactorySettings, Factory>
    {
        public Factory()
        {
            super(BillingTask.class);
        }

        @Override
        public List<FileType> getInputTypes()
        {
            return Collections.emptyList();
        }

        @Override
        public String getStatusName()
        {
            return PipelineJob.TaskStatus.running.toString();
        }

        @Override
        public List<String> getProtocolActionNames()
        {
            return Arrays.asList("Calculating Billing Data");
        }

        @Override
        public PipelineJob.Task createTask(PipelineJob job)
        {

            return new BillingTask(this, job);
        }

        @Override
        public boolean isJobComplete(PipelineJob job)
        {
            return false;
        }
    }

    @Override
    @NotNull
    public RecordedActionSet run() throws PipelineJobException
    {
        RecordedAction action = new RecordedAction();

        Container ehrContainer = getEHRContainer();
        if (ehrContainer == null)
            throw new PipelineJobException("EHRStudyContainer has not been set");

        Container billingContainer = EHR_BillingManager.get().getBillingContainer(getJob().getContainer());
        if (billingContainer == null)
            throw new PipelineJobException("Billing Container not found.");

        getJob().getLogger().info("Beginning process to save billing run data");
        getJob().getLogger().info("Start date: " + getSupport().getStartDate().toString());
        getJob().getLogger().info("End date: " + getSupport().getEndDate().toString());

        User user = getJob().getUser();
        Container container = getJob().getContainer();

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            getOrCreateInvoiceRunRecord();
            loadTransactionNumber();
            processingService.setBillingStartDate(getSupport().getStartDate());

            if (null != _previousInvoice)
            {
                processingService.processBillingRerun(_invoiceId, _invoiceRowId, getSupport().getStartDate(), getSupport().getEndDate(), getNextTransactionNumber(), user, billingContainer, getJob().getLogger());
            }
            else
            {

                for (BillingPipelineJobProcess process : processingService.getProcessList())
                {
                    Container billingRunContainer = process.isUseEHRContainer() ? ehrContainer : billingContainer;
                    runProcessing(process, billingRunContainer);
                }
            }

            updateInvoiceTable(billingContainer);

            processingService.performAdditionalProcessing(_invoiceId, user, container);

            transaction.commit();
        }

        return new RecordedActionSet(Collections.singleton(action));
    }

    private int _lastTransactionNumber;

    private void loadTransactionNumber()
    {
        SqlSelector se;
        if (DbScope.getLabKeyScope().getSqlDialect().isSqlServer())
            se = new SqlSelector(EHR_BILLING_SCHEMA,
                    new SQLFragment("select max(cast(transactionNumber as integer)) as expr from " + EHR_BillingSchema.NAME+ "." + EHR_BillingSchema.TABLE_INVOICED_ITEMS + " WHERE transactionNumber not like '%[^0-9]%'"));
        else if (DbScope.getLabKeyScope().getSqlDialect().isPostgreSQL())
        {
            se = new SqlSelector(EHR_BILLING_SCHEMA, new SQLFragment("select max(cast(transactionNumber as integer)) as expr from " + EHR_BillingSchema.NAME+ "." + EHR_BillingSchema.TABLE_INVOICED_ITEMS + " WHERE transactionNumber ~ '^[0-9]$'"));
        }
        else
        {
            throw new UnsupportedOperationException("The billing pipeline is only supported on sqlserver and postgres");
        }

        Integer[] rows = se.getArray(Integer.class);

        if (rows.length == 1)
        {
            _lastTransactionNumber = rows[0] == null ? 0 : rows[0];
        }
        else if (rows.length == 0)
        {
            _lastTransactionNumber = 0;
        }
        else
        {
            throw new IllegalArgumentException("Improper value for lastTransactionNumber.  Returned " + rows.length + " rows");
        }
    }

    private int getNextTransactionNumber()
    {
        _lastTransactionNumber++;

        return _lastTransactionNumber;
    }

    private Container getEHRContainer()
    {
        return EHRService.get().getEHRStudyContainer(getJob().getContainer());
    }

    private BillingPipelineJobSupport getSupport()
    {
        return (BillingPipelineJobSupport)getJob();
    }

    private String _invoiceId = null;
    private String _invoiceRowId  = null;
    // Pair of previous matching billing run's objectId and rowId
    private Pair<String,String> _previousInvoice = null;

    private String getOrCreateInvoiceRunRecord() throws PipelineJobException
    {
        if (_invoiceId != null)
            return _invoiceId;

        try
        {
            getJob().getLogger().info("Creating invoice run record");

            Date startDate = getSupport().getStartDate();
            Date endDate = getSupport().getEndDate();

            _previousInvoice = getSupport().getPreviousInvoice();

            Date today = DateUtils.truncate(new Date(), Calendar.DATE);
            if (endDate.after(today) || endDate.equals(today))
            {
                throw new PipelineJobException("Cannot create a billing run with an end date in the future");
            }

            TableInfo invoiceRuns = EHR_BillingSchema.getInstance().getTableInvoiceRuns();

            Map<String, Object> toCreate = new CaseInsensitiveHashMap<>();
            toCreate.put("billingPeriodStart", startDate);
            toCreate.put("billingPeriodEnd", endDate);
            toCreate.put("runDate", new Date());
            toCreate.put("status", "Finalized");

            var runComment = getSupport().getComment();
            var comment = null != _previousInvoice ?  "Rerun for " + _previousInvoice.second : runComment;
            toCreate.put("comment", comment);

            toCreate.put("container", getJob().getContainer().getId());
            toCreate.put("objectid", new GUID().toString());

            toCreate = Table.insert(getJob().getUser(), invoiceRuns, toCreate);
            _invoiceId = (String)toCreate.get("objectid");
            _invoiceRowId =  String.valueOf(toCreate.get("rowId"));
            return _invoiceId;
        }
        catch (RuntimeSQLException e)
        {
            throw new PipelineJobException(e);
        }
    }

    @Nullable
    private String getOrCreateInvoiceRecord(Map<String, Object> row, Date endDate) throws PipelineJobException
    {
        String invoiceNumber = processingService.getInvoiceNum(row, endDate);
        if (null != invoiceNumber)
        {
            try
            {
                TableInfo invoice = QueryService.get().getUserSchema(getJob().getUser(), getJob().getContainer(), "ehr_billing").getTable("invoice", null);
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("invoiceNumber"), invoiceNumber, CompareType.EQUAL);

                TableSelector ts = new TableSelector(invoice, filter, null);
                if (!ts.exists())
                {
                    getJob().getLogger().info("Creating invoice record for invoice number " + invoiceNumber);
                    Map<String, Object> toCreate = new CaseInsensitiveHashMap<>();
                    toCreate.put("invoiceNumber", invoiceNumber);
                    toCreate.put("accountNumber", row.get("debitedAccount"));
                    toCreate.put("container", getJob().getContainer().getId());
                    toCreate.put("invoiceRunId", _invoiceId);
                    // the project and chargeCategoryId are not present by default in invoice table and can be added as extensible columns
                    // the values are inserted in the billing re run as well in tnprc implementation
                    toCreate.put("project", row.get("project"));
                    toCreate.put("chargeCategoryId", row.get("chargeCategoryId"));

                    QueryUpdateService invoiceTableQUS = invoice.getUpdateService();
                    if (null != invoiceTableQUS)
                    {
                        BatchValidationException errors = new BatchValidationException();
                        invoice.getUpdateService().insertRows(getJob().getUser(), getJob().getContainer(), List.of(toCreate), errors, null, null);
                        if (errors.hasErrors())
                        {
                            throw errors;
                        }
                    }
                    else
                    {
                        Table.insert(getJob().getUser(), invoice, toCreate);
                    }
                }
                return invoiceNumber;
            }
            catch (RuntimeSQLException | DuplicateKeyException | BatchValidationException | QueryUpdateServiceException | SQLException e)
            {
                throw new PipelineJobException(e);
            }
        }
        return null;
    }

    private void writeToInvoicedItems(BillingPipelineJobProcess process, Collection<Map<String, Object>> rows, BillingPipelineJobSupport support) throws PipelineJobException
    {
        Set<String> queryColNames = process.getQueryToInvoiceItemColMap().keySet();
        String invoiceId = getOrCreateInvoiceRunRecord();

        try
        {
            TableInfo invoicedItems = QueryService.get().getUserSchema(getJob().getUser(), getJob().getContainer(),
                    EHR_BillingSchema.NAME).getTable(EHR_BillingSchema.TABLE_INVOICED_ITEMS);
            for (Map<String, Object> row : rows)
            {
                String invoiceNumber = getOrCreateInvoiceRecord(row, support.getEndDate());
                if (null == invoiceNumber)
                    continue;

                Map<String,Object> toInsert = new CaseInsensitiveHashMap<>();
                toInsert.put("container", getJob().getContainer().getId());
                toInsert.put("objectId", new GUID());
                toInsert.put("invoiceId", invoiceId);
                toInsert.put("transactionNumber", getNextTransactionNumber());
                toInsert.put("invoiceNumber", invoiceNumber);
                toInsert.put("category", process.getLabel());

                for (String field : queryColNames)
                {
                    String invoicedItemColName = process.getQueryToInvoiceItemColMap().get(field);
                    if (invoicedItemColName != null)
                    {
                        toInsert.put(invoicedItemColName, row.get(field));
                    }
                }

                for (String field : process.getRequiredFields())
                {
                    if (toInsert.get(field) == null)
                    {
                        getJob().getLogger().warn("Missing value for field: " + field + " for transactionNumber: " + toInsert.get("transactionNumber"));
                    }
                }

                BatchValidationException errors = new BatchValidationException();
                invoicedItems.getUpdateService().insertRows(getJob().getUser(), getJob().getContainer(), Collections.singletonList(toInsert), errors, null, null);
                if (errors.hasErrors())
                {
                    throw errors;
                }
            }

            //update records in miscCharges to show proper invoiceId
            if (process.isMiscCharges())
                updateProcessedMiscChargesRecords(process, rows);
        }
        catch (Exception e)
        {
            throw new PipelineJobException(e);
        }
    }

    private void updateProcessedMiscChargesRecords(BillingPipelineJobProcess process, Collection<Map<String, Object>> rows) throws PipelineJobException
    {
        try
        {
            TableInfo ti = process.getMiscChargesTableInfo() != null ? process.getMiscChargesTableInfo() : EHR_BillingSchema.getInstance().getMiscCharges();
            String invoiceId = getOrCreateInvoiceRunRecord();
            getJob().getLogger().info("Updating " + rows.size() + " records in " + ti.getName() + " table");

            int updates = 0;
            for (Map<String, Object> row : rows)
            {
                String objectId = (String)row.get("sourceRecord");
                Map<String, Object> toUpdate = new CaseInsensitiveHashMap<>();
                toUpdate.put("invoiceId", invoiceId);

                updates++;
                Table.update(getJob().getUser(), ti, toUpdate, objectId);
            }

            getJob().getLogger().info("Finished updating " + updates + " records in " + ti.getName() + " table.");
        }
        catch (RuntimeSQLException e)
        {
            throw new PipelineJobException(e);
        }

        getJob().getLogger().info("Finished updating records for Invoice Run Id " + _invoiceId);
    }

    private Collection<Map<String, Object>> getRowList(BillingPipelineJobProcess process, Container container)
    {
        String schemaName = process.getSchemaName();
        String queryName = process.getQueryName();
        UserSchema us = QueryService.get().getUserSchema(getJob().getUser(), container, schemaName);
        TableInfo ti = us.getTable(queryName, null);

        Set<String> queryColNames = process.getQueryToInvoiceItemColMap().keySet();
        List<FieldKey> columns = new ArrayList<>();
        for (String col : queryColNames)
        {
            columns.add(FieldKey.fromString(col));
        }

        //also include isMiscCharge if appropriate
        if (process.isMiscCharges())
        {
            columns.add(FieldKey.fromString("isMiscCharge"));
        }

        final Map<FieldKey, ColumnInfo> colKeys = QueryService.get().getColumns(ti, columns);
        for (FieldKey col : columns)
        {
            if (col == null)
                continue;

            if (!colKeys.containsKey(col))
            {
                getJob().getLogger().warn("Unable to find column with key: " + col + " for table: " + ti.getPublicName());
            }
        }

        TableSelector ts = new TableSelector(ti, colKeys.values(), null, null);
        ts.setNamedParameters(process.getQueryParams(getSupport()));
        return ts.getMapCollection();
    }

    private void runProcessing(BillingPipelineJobProcess process, Container billingRunContainer) throws PipelineJobException
    {
        getJob().getLogger().info("Caching " + process.getLabel());

        if (process.isProcedureCharges())
        {
            ArrayList<ChargeInfo> chargeInfoArrayList = getChargeIdWithAssociatedInfo(billingRunContainer);

            getJob().getLogger().info("Querying ehr_billing.procedureQueryChargeIdAssoc table to get procedures info");
            UserSchema us = QueryService.get().getUserSchema(getJob().getUser(), billingRunContainer, EHR_BILLING_SCHEMA.getName());
            TableInfo ti = us.getTable("procedureQueryChargeIdAssoc", null);
            TableSelector ts = new TableSelector(ti);
            Collection<Map<String, Object>> procedureQueries = ts.getMapCollection();

            // iterate through Procedure queries associated with a chargeId
            for(Map<String, Object> row : procedureQueries)
            {
                String procedureSchema = (String) row.get("schemaName");
                String procedureQuery = (String) row.get("queryName");
                int chargeId = (Integer) row.get("chargeId");

                getJob().getLogger().info("Processing ");

                // for each procedure query, get query results
                UserSchema schema = QueryService.get().getUserSchema(getJob().getUser(), billingRunContainer, procedureSchema);
                TableInfo procedureQueryTi = schema.getTable(procedureQuery, null);
                TableSelector procedureQueryTs = new TableSelector(procedureQueryTi);
                Collection<Map<String, Object>> procedureRows = procedureQueryTs.getMapCollection();

                //iterate through procedure query results
                for (Map<String, Object> procedureRow : procedureRows)
                {
                    // for each row, associate chargeId
                    procedureRow.put("chargeId", chargeId);

                    // add additional charge info
                    ChargeInfo ci = getChargeInfo(chargeId, chargeInfoArrayList, (Date) procedureRow.get("date"));
                    procedureRow.put("item", ci.getItem());
                    procedureRow.put("category", ci.getCategory());

                    // get cost
                    Double unitCost = ci.getUnitCost();
                    procedureRow.put(processingService.getUnitCostColName(), unitCost);

                    // total cost
                    Double totalCost = unitCost * (Double) procedureRow.get("quantity");
                    procedureRow.put(processingService.getTotalCostColName(), totalCost);

                    // calculate total cost with additional/other rate (ex. tier rate for WNPRC)
                    Double otherRate = (Double) procedureRow.get("otherRate");
                    Double unitCostWithOtherRate;
                    Double totalCostWithOtherRate;
                    if (null != otherRate &&
                            null != processingService.getAdditionalUnitCostColName() &&
                            null != processingService.getAdditionalTotalCostColName())
                    {
                        unitCostWithOtherRate = unitCost + (unitCost * otherRate);
                        procedureRow.put(processingService.getAdditionalUnitCostColName(), unitCostWithOtherRate);

                        totalCostWithOtherRate = unitCostWithOtherRate * (Double) procedureRow.get("quantity");
                        procedureRow.put(processingService.getAdditionalTotalCostColName(), totalCostWithOtherRate);
                    }

                     writeToInvoicedItems(process, procedureRows, getSupport());
                }
            }
        }
        else if (process.getQueryName() != null && !process.getQueryToInvoiceItemColMap().isEmpty())
        {
            Collection<Map<String, Object>> rows = getRowList(process, billingRunContainer);
            getJob().getLogger().info(rows.size() + " rows found");

            writeToInvoicedItems(process, rows, getSupport());
        }
        getJob().getLogger().info("Finished Caching " + process.getLabel());
    }

    private ChargeInfo getChargeInfo(int chargeId, ArrayList<ChargeInfo> chargeInfoArrayList, Object date)
    {
        Date chargeDate = (Date) date;
        List<ChargeInfo> chargeInfoList = chargeInfoArrayList.stream().filter(ci -> ci.getChargeId() == chargeId).toList();

        if (chargeInfoList.size() == 1)
        {
            ChargeInfo ci = chargeInfoList.get(0);
            if (chargeDate.after(ci.getChargeRateStartDate()) && chargeDate.before(ci.getChargeRateEndDate()))
            {
                return ci;
            }
        }
        else if (chargeInfoList.size() > 1)
        {
            for (ChargeInfo ci : chargeInfoList)
            {
                if (chargeDate.after(ci.getChargeRateStartDate()) && chargeDate.before(ci.getChargeRateEndDate()))
                {
                    return ci;
                }
            }
        }

        return new ChargeInfo();
    }

    private ArrayList<ChargeInfo> getChargeIdWithAssociatedInfo(Container billingRunContainer)
    {
        Map<Integer, ChargeInfo> chargeIdInfoMap = new HashMap<>();

        UserSchema us = QueryService.get().getUserSchema(getJob().getUser(), billingRunContainer, EHR_BILLING_SCHEMA.getName());
        TableInfo ti = us.getTable("chargeItemsWithRates", null);

        TableSelector ts = new TableSelector(ti, Set.of("chargeId", "item", "category", "departmentCode", "chargeableItemStartDate", "chargeableItemEndDate", "unitCost", "chargeRateStartDate", "chargeRateEndDate"));
        ArrayList<ChargeInfo> chargeInfoArrayList = ts.getArrayList(ChargeInfo.class);

        return chargeInfoArrayList;
    }

    public static class ChargeInfo
    {
        private int _chargeId;
        private String _item;
        private String _category;
        private String _departmentCode;
        private Date _chargeableItemStartDate;
        private Date _chargeableItemEndDate;
        private double _unitCost;
        private Date _chargeRateStartDate;
        private Date _chargeRateEndDate;

        public int getChargeId()
        {
            return _chargeId;
        }

        public void setChargeId(int chargeId)
        {
            _chargeId = chargeId;
        }

        public String getItem()
        {
            return _item;
        }

        public void setItem(String item)
        {
            _item = item;
        }

        public String getCategory()
        {
            return _category;
        }

        public void setCategory(String category)
        {
            _category = category;
        }

        public String getDepartmentCode()
        {
            return _departmentCode;
        }

        public void setDepartmentCode(String departmentCode)
        {
            _departmentCode = departmentCode;
        }

        public Date getChargeableItemStartDate()
        {
            return _chargeableItemStartDate;
        }

        public void setChargeableItemStartDate(Date chargeableItemStartDate)
        {
            _chargeableItemStartDate = chargeableItemStartDate;
        }

        public Date getChargeableItemEndDate()
        {
            return _chargeableItemEndDate;
        }

        public void setChargeableItemEndDate(Date chargeableItemEndDate)
        {
            _chargeableItemEndDate = chargeableItemEndDate;
        }

        public double getUnitCost()
        {
            return _unitCost;
        }

        public void setUnitCost(double unitCost)
        {
            _unitCost = unitCost;
        }

        public Date getChargeRateStartDate()
        {
            return _chargeRateStartDate;
        }

        public void setChargeRateStartDate(Date chargeRateStartDate)
        {
            _chargeRateStartDate = chargeRateStartDate;
        }

        public Date getChargeRateEndDate()
        {
            return _chargeRateEndDate;
        }

        public void setChargeRateEndDate(Date chargeRateEndDate)
        {
            _chargeRateEndDate = chargeRateEndDate;
        }
    }

    private void updateInvoiceTable(Container billingRunContainer)
    {
        getJob().getLogger().info("Updating rows with invoiceAmount in ehr_billing.invoice table");

        TableInfo invoice = EHR_BillingSchema.getInstance().getInvoice();
        try (TableResultSet invoiceTotalCost = getInvoiceTotalCost(billingRunContainer))
        {
            Iterator<Map<String, Object>> iterator = invoiceTotalCost.iterator();
            Map<String, BigDecimal> existingInvoiceAmounts = getExistingInvoiceAmounts();

            getJob().getLogger().info(invoiceTotalCost.getSize() + " rows to be updated");

            while (iterator.hasNext())
            {
                Map<String, Object> row = iterator.next();
                String invoiceNumber = (String) row.get("invoiceNumber");

                if (null == existingInvoiceAmounts.get(invoiceNumber))
                {
                    Map<String, Object> toUpdate = new CaseInsensitiveHashMap<>();

                    for (String col : row.keySet())
                    {
                        if (col.equals("_row"))
                            continue;

                        toUpdate.put(col, row.get(col));
                    }

                    Table.update(getJob().getUser(), invoice, toUpdate, invoiceNumber);
                }
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }

        getJob().getLogger().info("Finished updating rows in ehr_billing.invoice table");
    }


    private Map<String,BigDecimal> getExistingInvoiceAmounts()
    {
        SQLFragment sqlFragment = new SQLFragment();
        sqlFragment.append("SELECT invoiceNumber, invoiceAmount ");
        sqlFragment.append("FROM ").append(EHR_BILLING_SCHEMA.getName()).append(".invoice ");

        SqlSelector selector = new SqlSelector(EHR_BILLING_SCHEMA, sqlFragment);
        var rows = selector.getMapCollection();

        Map<String,BigDecimal> existingInvoiceAmounts = new HashMap<>();
        rows.forEach(row -> existingInvoiceAmounts.put(row.get("invoiceNumber").toString(), (BigDecimal) row.get("invoiceAmount")));
        return existingInvoiceAmounts;
    }

    private TableResultSet getInvoiceTotalCost(Container billingContainer)
    {
        SQLFragment sqlFragment = new SQLFragment();
        sqlFragment.append("SELECT\n");
        sqlFragment.append("invItm.invoiceNumber, sum(totalcost) as invoiceAmount\n");
        sqlFragment.append("FROM ").append(EHR_BILLING_SCHEMA.getName()).append(".invoicedItems invItm\n");
        sqlFragment.append("INNER JOIN ").append(EHR_BILLING_SCHEMA.getName()).append(".invoice inv\n");
        sqlFragment.append("ON invItm.invoiceNumber = inv.invoiceNumber\n");
        sqlFragment.append("WHERE invItm.container = ?\n");
        sqlFragment.add(billingContainer.getId());
        sqlFragment.append("group by\n");
        sqlFragment.append("invItm.debitedAccount,\n");
        sqlFragment.append("invItm.invoiceNumber,\n");
        sqlFragment.append("inv.invoiceRunId\n");

        SqlSelector selector = new SqlSelector(EHR_BILLING_SCHEMA, sqlFragment);
        return selector.getResultSet();
    }
}