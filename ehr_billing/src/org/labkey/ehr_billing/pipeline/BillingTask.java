/*
 * Copyright (c) 2018 LabKey Corporation
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
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.Results;
import org.labkey.api.data.ResultsImpl;
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
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.util.FileType;
import org.labkey.api.util.GUID;
import org.labkey.ehr_billing.EHR_BillingManager;
import org.labkey.ehr_billing.EHR_BillingSchema;

import java.sql.SQLException;
import java.text.SimpleDateFormat;
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
    private final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
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

        public List<FileType> getInputTypes()
        {
            return Collections.emptyList();
        }

        public String getStatusName()
        {
            return PipelineJob.TaskStatus.running.toString();
        }

        public List<String> getProtocolActionNames()
        {
            return Arrays.asList("Calculating Billing Data");
        }

        public PipelineJob.Task createTask(PipelineJob job)
        {
            BillingTask task = new BillingTask(this, job);

            return task;
        }

        public boolean isJobComplete(PipelineJob job)
        {
            return false;
        }
    }

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

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            getOrCreateInvoiceRunRecord();
            loadTransactionNumber();
            for (BillingPipelineJobProcess process : processingService.getProcessList())
            {
                Container billingRunContainer = process.isUseEHRContainer() ? ehrContainer : billingContainer;
                runProcessing(process, billingRunContainer);
            }
            updateInvoiceTable(billingContainer);

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

    private String getOrCreateInvoiceRunRecord() throws PipelineJobException
    {
        if (_invoiceId != null)
            return _invoiceId;

        try
        {
            getJob().getLogger().info("Creating invoice run record");

            // first look for existing records overlapping the provided date range.
            // so this should not be a problem
            TableInfo invoiceRunsUser = QueryService.get().getUserSchema(getJob().getUser(), getJob().getContainer(),
                    EHR_BillingSchema.NAME).getTable(EHR_BillingSchema.TABLE_INVOICE_RUNS);
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("billingPeriodStart"), getSupport().getEndDate(), CompareType.DATE_LTE);
            filter.addCondition(FieldKey.fromString("billingPeriodEnd"), getSupport().getStartDate(), CompareType.DATE_GTE);


            TableSelector ts = new TableSelector(invoiceRunsUser, filter, null);
            if (ts.exists())
            {
                throw new PipelineJobException("There is already an existing billing period that overlaps the provided interval");
            }

            if (getSupport().getEndDate().before(getSupport().getStartDate()))
            {
                throw new PipelineJobException("Cannot create a billing run with an end date before the start date");
            }

            if(getSupport().getEndDate().equals(getSupport().getStartDate()))
            {
                throw new PipelineJobException("Cannot create a billing run with the same start and end date");
            }

            Date today = DateUtils.truncate(new Date(), Calendar.DATE);
            if (getSupport().getEndDate().after(today) || getSupport().getEndDate().equals(today))
            {
                throw new PipelineJobException("Cannot create a billing run with an end date in the future");
            }

            TableInfo invoiceRuns = EHR_BillingSchema.getInstance().getTableInvoiceRuns();

            Map<String, Object> toCreate = new CaseInsensitiveHashMap<>();
            toCreate.put("billingPeriodStart", getSupport().getStartDate());
            toCreate.put("billingPeriodEnd", getSupport().getEndDate());
            toCreate.put("runDate", new Date());
            toCreate.put("status", "Finalized");
            toCreate.put("comment", getSupport().getComment());

            toCreate.put("container", getJob().getContainer().getId());
            toCreate.put("objectid", new GUID().toString());

            toCreate = Table.insert(getJob().getUser(), invoiceRuns, toCreate);
            _invoiceId = (String)toCreate.get("objectid");
            return _invoiceId;
        }
        catch (RuntimeSQLException e)
        {
            throw new PipelineJobException(e);
        }
    }

    private String getOrCreateInvoiceRecord(Map<String, Object> row, Date endDate) throws PipelineJobException
    {
        String invoiceNumber = processingService.getInvoiceNum(row, endDate);
        try
        {
            TableInfo invoice = EHR_BillingSchema.getInstance().getInvoice();
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("invoiceNumber"), invoiceNumber, CompareType.EQUAL);

            TableSelector ts = new TableSelector(invoice, filter, null);
            if(!ts.exists())
            {
                getJob().getLogger().info("Creating invoice record for invoice number " + invoiceNumber);
                Map<String, Object> toCreate = new CaseInsensitiveHashMap<>();
                toCreate.put("invoiceNumber", invoiceNumber);
                toCreate.put("accountNumber", row.get("debitedAccount"));
                toCreate.put("container", getJob().getContainer().getId());
                toCreate.put("invoiceRunId", _invoiceId);

                Table.insert(getJob().getUser(), invoice, toCreate);
            }
            return invoiceNumber;
        }
        catch (RuntimeSQLException e)
        {
            throw new PipelineJobException(e);
        }
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
                CaseInsensitiveHashMap toInsert = new CaseInsensitiveHashMap();
                toInsert.put("container", getJob().getContainer().getId());
                toInsert.put("objectId", new GUID());
                toInsert.put("invoiceId", invoiceId);
                toInsert.put("transactionNumber", getNextTransactionNumber());
                toInsert.put("invoiceNumber", getOrCreateInvoiceRecord(row, support.getEndDate()));
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
        TableInfo ti = us.getTable(queryName);

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
                getJob().getLogger().warn("Unable to find column with key: " + col.toString() + " for table: " + ti.getPublicName());
            }
        }

        TableSelector ts = new TableSelector(ti, colKeys.values(), null, null);
        ts.setNamedParameters(process.getQueryParams(getSupport()));
        return ts.getMapCollection();
    }

    private void runProcessing(BillingPipelineJobProcess process, Container billingRunContainer) throws PipelineJobException
    {
        if (process != null && process.getQueryName() != null && !process.getQueryToInvoiceItemColMap().isEmpty())
        {
            getJob().getLogger().info("Caching " + process.getLabel());

            Collection<Map<String, Object>> rows = getRowList(process, billingRunContainer);
            getJob().getLogger().info(rows.size() + " rows found");

            writeToInvoicedItems(process, rows, getSupport());
            getJob().getLogger().info("Finished Caching " + process.getLabel());
        }
    }

    private void updateInvoiceTable(Container billingRunContainer)
    {
        getJob().getLogger().info("Updating rows with invoiceAmount in ehr_billing.invoice table");

        TableInfo invoice = EHR_BillingSchema.getInstance().getInvoice();
        TableResultSet invoiceTotalCost = getInvoiceTotalCost(billingRunContainer);
        Iterator<Map<String, Object>> iterator = invoiceTotalCost.iterator();

        getJob().getLogger().info(invoiceTotalCost.getSize() + " rows to be updated");

        while (iterator.hasNext())
        {
            Map<String, Object> row = iterator.next();
            String invoiceNumber = (String) row.get("invoiceNumber");

            CaseInsensitiveHashMap toUpdate = new CaseInsensitiveHashMap();

            for(String col : row.keySet())
            {
                if(col.equals("_row"))
                    continue;

                toUpdate.put(col, row.get(col));
            }

            Table.update(getJob().getUser(), invoice, toUpdate, invoiceNumber);
        }
        try
        {
            invoiceTotalCost.close();
        }
        catch (SQLException e)
        {
            getJob().getLogger().info("Something went wrong while attempting to close a result set for Invoice Total Cost.", e);
            return;
        }

        getJob().getLogger().info("Finished updating rows in ehr_billing.invoice table");
    }

    private TableResultSet getInvoiceTotalCost(Container billingContainer)
    {
        SQLFragment sqlFragment = new SQLFragment();
        sqlFragment.append("SELECT\n");
        sqlFragment.append("invItm.invoiceNumber, sum(totalcost) as invoiceAmount\n");
        sqlFragment.append("FROM " + EHR_BILLING_SCHEMA.getName() + ".invoicedItems invItm\n");
        sqlFragment.append("INNER JOIN " + EHR_BILLING_SCHEMA.getName() + ".invoice inv\n");
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