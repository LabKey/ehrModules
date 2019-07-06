/*
 * Copyright (c) 2017-2019 LabKey Corporation
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

package org.labkey.ehr_billing;

import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.api.data.RuntimeSQLException;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

public class EHR_BillingManager
{
    private static EHR_BillingManager _instance = new EHR_BillingManager();
    public static final String EHR_BillingContainerPropName = "BillingContainer";

    private EHR_BillingManager()
    {

    }

    public static EHR_BillingManager get()
    {
        return _instance;
    }

    public List<String> deleteBillingRuns(User user, Container container, Collection<String> pks, boolean testOnly) throws SQLException, QueryUpdateServiceException, BatchValidationException, InvalidKeyException
    {
        TableInfo invoice = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_INVOICE);
        TableInfo invoiceRuns = QueryService.get().getUserSchema(user, container,EHR_BillingSchema.NAME).getTable(EHR_BillingSchema.TABLE_INVOICE_RUNS);
        TableInfo invoicedItems = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_INVOICED_ITEMS);
        TableInfo miscCharges = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_MISC_CHARGES);

        //create filters
        SimpleFilter objectIdFilter = new SimpleFilter(FieldKey.fromString("objectid"), pks, CompareType.IN);
        SimpleFilter invoiceIdFilter = new SimpleFilter(FieldKey.fromString("invoiceId"), pks, CompareType.IN);
        SimpleFilter invoiceRunIdFilter = new SimpleFilter(FieldKey.fromString("invoiceRunId"), pks, CompareType.IN);

        SimpleFilter miscChargesFilter = new SimpleFilter(FieldKey.fromString("invoiceId"), pks, CompareType.IN);

        //perform the work
        List<String> ret = new ArrayList<>();
        if (testOnly)
        {
            TableSelector tsInvItems = new TableSelector(invoicedItems, invoiceIdFilter, null);
            ret.add(tsInvItems.getRowCount() + " records from invoiced items");

            TableSelector tsInvoice = new TableSelector(invoice, invoiceRunIdFilter, null);
            ret.add(tsInvoice.getRowCount() + " records from invoice");

            TableSelector tsMiscCharges2 = new TableSelector(miscCharges, miscChargesFilter, null);
            ret.add(tsMiscCharges2.getRowCount() + " invoice records from misc charges will be removed from the deleted invoice, which means they will be picked up by the next billing period.  They are not deleted.");
        }
        else
        {
            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
            {
                Table.delete(invoicedItems, invoiceIdFilter);
                Table.delete(invoice, invoiceRunIdFilter);

                TableSelector tsMiscCharges2 = new TableSelector(miscCharges, Collections.singleton("objectid"), miscChargesFilter, null);
                String[] miscChargesIds = tsMiscCharges2.getArray(String.class);
                for (String objectid : miscChargesIds)
                {
                    Map<String, Object> map = new CaseInsensitiveHashMap<>();
                    map.put("invoiceId", null);
                    map = Table.update(user, miscCharges, map, objectid);
                }

                TableSelector tsInvoiceRuns = new TableSelector(invoiceRuns, objectIdFilter, null);
                Map<String, Object>[] invoiceRunRows = tsInvoiceRuns.getMapArray();
                deleteInvoiceRuns(invoiceRuns, invoiceRunRows, user, container);

                transaction.commit();
            }
        }

        return ret;
    }

    private void deleteInvoiceRuns(TableInfo tableInfo, Map<String, Object>[] rows, User user, Container container) throws QueryUpdateServiceException, BatchValidationException, InvalidKeyException
    {
        if(rows.length>0)
        {
            try
            {
                tableInfo.getUpdateService().deleteRows(user, container, Arrays.asList(rows), null, null);
            }
            catch (SQLException e)
            {
                throw new RuntimeSQLException(e);
            }
        }
    }

    public Container getBillingContainer(Container c)
    {
        Module billing = ModuleLoader.getInstance().getModule(EHR_BillingModule.NAME);
        ModuleProperty mp = billing.getModuleProperties().get(EHR_BillingContainerPropName);
        String path = mp.getEffectiveValue(c);
        if (path == null)
            return null;

        return ContainerManager.getForPath(path);

    }

}