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

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
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
import org.labkey.api.util.GUID;
import org.labkey.api.util.JunitUtil;
import org.labkey.api.util.TestContext;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EHR_BillingManager
{
    private static final EHR_BillingManager _instance = new EHR_BillingManager();
    public static final String EHR_BillingContainerPropName = "BillingContainer";

    private EHR_BillingManager()
    {

    }

    public static EHR_BillingManager get()
    {
        return _instance;
    }

    public List<String> deleteBillingRuns(User user, Container container, Collection<String> pks, boolean testOnly) throws QueryUpdateServiceException, BatchValidationException, InvalidKeyException
    {
        TableInfo invoice = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_INVOICE);
        TableInfo invoiceRuns = QueryService.get().getUserSchema(user, container,EHR_BillingSchema.NAME).getTable(EHR_BillingSchema.TABLE_INVOICE_RUNS);
        TableInfo invoicedItems = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_INVOICED_ITEMS);
        TableInfo miscCharges = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_MISC_CHARGES);

        //create filters
        SimpleFilter objectIdFilter = createContainerScopedInFilter(container, "objectid", pks);
        SimpleFilter invoiceIdFilter = createContainerScopedInFilter(container, "invoiceId", pks);
        SimpleFilter invoiceRunIdFilter = createContainerScopedInFilter(container, "invoiceRunId", pks);

        SimpleFilter miscChargesFilter = createContainerScopedInFilter(container, "invoiceId", pks);

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
                    Table.update(user, miscCharges, map, objectid);
                }

                TableSelector tsInvoiceRuns = new TableSelector(invoiceRuns, objectIdFilter, null);
                Map<String, Object>[] invoiceRunRows = tsInvoiceRuns.getMapArray();
                deleteInvoiceRuns(invoiceRuns, invoiceRunRows, user, container);

                transaction.commit();
            }
        }

        return ret;
    }

    private SimpleFilter createContainerScopedInFilter(Container container, String columnName, Collection<String> values)
    {
        return SimpleFilter.createContainerFilter(container).addInClause(FieldKey.fromString(columnName), values);
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

    public static class TestCase extends Assert
    {
        private static final String FOLDER_A = "EHRBillingDeleteTestA";
        private static final String FOLDER_B = "EHRBillingDeleteTestB";

        private User _user;
        private Container _containerA;
        private Container _containerB;
        private String _runIdA;
        private String _runIdB;

        @Before
        public void setUp()
        {
            _user = TestContext.get().getUser();
            deleteTestFolders();

            Container junit = JunitUtil.getTestContainer();
            _containerA = createBillingFolder(junit, FOLDER_A);
            _containerB = createBillingFolder(junit, FOLDER_B);

            _runIdA = insertBillingRun(_containerA);
            _runIdB = insertBillingRun(_containerB);
        }

        @After
        public void tearDown()
        {
            deleteTestFolders();
        }

        @Test
        public void testDeleteBillingRunsIsContainerScoped() throws Exception
        {
            EHR_BillingManager manager = EHR_BillingManager.get();
            EHR_BillingSchema schema = EHR_BillingSchema.getInstance();

            // A testOnly preview issued from container A targeting container B's run must not see container B's rows
            for (String summary : manager.deleteBillingRuns(_user, _containerA, List.of(_runIdB), true))
                assertTrue("Preview from another container should count 0 rows, but got: " + summary, summary.startsWith("0 "));

            // An actual delete issued from container A targeting container B's run must leave container B untouched
            manager.deleteBillingRuns(_user, _containerA, List.of(_runIdB), false);
            assertEquals("invoiceRuns row in container B should survive a delete issued from container A", 1, containerRowCount(schema.getTableInvoiceRuns(), _containerB));
            assertEquals("invoice row in container B should survive a delete issued from container A", 1, containerRowCount(schema.getInvoice(), _containerB));
            assertEquals("invoicedItems row in container B should survive a delete issued from container A", 1, containerRowCount(schema.getTableInvoiceItems(), _containerB));
            assertEquals("miscCharges row in container B should still reference its invoice", 1, miscChargesWithInvoiceCount(_containerB));

            // Positive control: deleting a run from its own container removes its rows
            manager.deleteBillingRuns(_user, _containerA, List.of(_runIdA), false);
            assertEquals("invoiceRuns row in container A should be deleted", 0, containerRowCount(schema.getTableInvoiceRuns(), _containerA));
            assertEquals("invoice row in container A should be deleted", 0, containerRowCount(schema.getInvoice(), _containerA));
            assertEquals("invoicedItems row in container A should be deleted", 0, containerRowCount(schema.getTableInvoiceItems(), _containerA));
            assertEquals("miscCharges row in container A should be detached from the deleted invoice", 0, miscChargesWithInvoiceCount(_containerA));
            assertEquals("miscCharges row in container A should not be deleted", 1, containerRowCount(schema.getMiscCharges(), _containerA));
        }

        private Container createBillingFolder(Container parent, String name)
        {
            Container c = ContainerManager.createContainer(parent, name, _user);
            Set<Module> active = new HashSet<>(c.getActiveModules());
            active.add(ModuleLoader.getInstance().getModule(EHR_BillingModule.NAME));
            c.setActiveModules(active, _user);
            return c;
        }

        private String insertBillingRun(Container c)
        {
            EHR_BillingSchema schema = EHR_BillingSchema.getInstance();
            String runId = GUID.makeGUID();
            String invoiceNumber = c.getName();

            Map<String, Object> run = new CaseInsensitiveHashMap<>();
            run.put("objectid", runId);
            run.put("runDate", new Date());
            run.put("container", c.getId());
            Table.insert(_user, schema.getTableInvoiceRuns(), run);

            Map<String, Object> invoice = new CaseInsensitiveHashMap<>();
            invoice.put("invoiceNumber", invoiceNumber);
            invoice.put("invoiceRunId", runId);
            invoice.put("container", c.getId());
            Table.insert(_user, schema.getInvoice(), invoice);

            Map<String, Object> invoicedItem = new CaseInsensitiveHashMap<>();
            invoicedItem.put("objectId", GUID.makeGUID());
            invoicedItem.put("invoiceId", runId);
            invoicedItem.put("invoiceNumber", invoiceNumber);
            invoicedItem.put("container", c.getId());
            Table.insert(_user, schema.getTableInvoiceItems(), invoicedItem);

            Map<String, Object> miscCharge = new CaseInsensitiveHashMap<>();
            miscCharge.put("objectid", GUID.makeGUID());
            miscCharge.put("invoiceId", runId);
            miscCharge.put("container", c.getId());
            Table.insert(_user, schema.getMiscCharges(), miscCharge);

            return runId;
        }

        private long containerRowCount(TableInfo table, Container c)
        {
            return new TableSelector(table, SimpleFilter.createContainerFilter(c), null).getRowCount();
        }

        private long miscChargesWithInvoiceCount(Container c)
        {
            SimpleFilter filter = SimpleFilter.createContainerFilter(c);
            filter.addCondition(FieldKey.fromParts("invoiceId"), null, CompareType.NONBLANK);
            return new TableSelector(EHR_BillingSchema.getInstance().getMiscCharges(), filter, null).getRowCount();
        }

        private void deleteTestFolders()
        {
            Container junit = JunitUtil.getTestContainer();
            for (String name : List.of(FOLDER_A, FOLDER_B))
            {
                Container c = junit.getChild(name);
                if (c != null)
                    ContainerManager.delete(c, _user);
            }
        }
    }
}
