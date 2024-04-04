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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager.ContainerListener;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.User;
import java.util.Collections;
import java.util.Collection;

import java.beans.PropertyChangeEvent;

public class EHR_BillingContainerListener implements ContainerListener
{
    @Override
    public void containerCreated(Container c, User user)
    {
    }

    @Override
    public void containerDeleted(Container c, User user)
    {
        // This will clean up the ehr_billing schema.  For extensible tables, exp module should clean up related exp data.
        DbScope scope = EHR_BillingSchema.getInstance().getSchema().getScope();
        SimpleFilter containerFilter = SimpleFilter.createContainerFilter(c);
        try (DbScope.Transaction transaction = scope.ensureTransaction())
        {
            TableInfo aliasesTable = EHR_BillingSchema.getInstance().getAliasesTable();
            if (aliasesTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(aliasesTable, containerFilter);

            TableInfo chargeRatesTable = EHR_BillingSchema.getInstance().getChargeRatesTable();
            if (chargeRatesTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(chargeRatesTable, containerFilter);

            TableInfo invoiceItemsTable = EHR_BillingSchema.getInstance().getTableInvoiceItems();
            if (invoiceItemsTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(invoiceItemsTable, containerFilter);

            TableInfo invoiceTable = EHR_BillingSchema.getInstance().getInvoice();
            if (invoiceTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(invoiceTable, containerFilter);

            TableInfo invoiceRunsTable = EHR_BillingSchema.getInstance().getTableInvoiceRuns();
            if (invoiceRunsTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(invoiceRunsTable, containerFilter);

            TableInfo miscChargesTable = EHR_BillingSchema.getInstance().getMiscCharges();
            if (miscChargesTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(miscChargesTable, containerFilter);

            TableInfo chargeableItemsTable = EHR_BillingSchema.getInstance().getChargeableItems();
            if (chargeableItemsTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(chargeableItemsTable, containerFilter);

            TableInfo chargeableItemsCategories = EHR_BillingSchema.getInstance().getChargeableItemCategories();
            if (chargeableItemsCategories.getTableType() == DatabaseTableType.TABLE)
                Table.delete(chargeableItemsCategories, containerFilter);

            TableInfo chargeUnitsTable = EHR_BillingSchema.getInstance().getChargeUnits();
            if (chargeUnitsTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(chargeUnitsTable, containerFilter);

            TableInfo chargeRateExemptionsTable = EHR_BillingSchema.getInstance().getChargeRateExemptions();
            if (chargeRateExemptionsTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(chargeRateExemptionsTable, containerFilter);

            TableInfo dataAccessTable = EHR_BillingSchema.getInstance().getDataAccessTable();
            if (dataAccessTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(dataAccessTable, containerFilter);

            TableInfo chargeableItemCategoriesTable = EHR_BillingSchema.getInstance().getChargeableItemCategories();
            if (chargeableItemCategoriesTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(chargeableItemCategoriesTable, containerFilter);

            TableInfo procedurequerychargeidassocTable = EHR_BillingSchema.getInstance().getProcedureQueryChargeIdAssoc();
            if (procedurequerychargeidassocTable.getTableType() == DatabaseTableType.TABLE)
                Table.delete(procedurequerychargeidassocTable, containerFilter);

            transaction.commit();
        }
    }

    @Override
    public void propertyChange(PropertyChangeEvent evt)
    {
    }

    @Override
    public void containerMoved(Container c, Container oldParent, User user)
    {
    }

    @NotNull @Override
    public Collection<String> canMove(Container c, Container newParent, User user)
    {
        return Collections.emptyList();
    }
}