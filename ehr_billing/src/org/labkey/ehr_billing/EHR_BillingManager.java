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
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;

import java.util.ArrayList;
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

    public List<String> deleteBillingRuns(User user, Collection<String> pks, boolean testOnly)
    {
        TableInfo invoiceRuns = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_INVOICE_RUNS);
        TableInfo invoicedItems = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_INVOICED_ITEMS);
        TableInfo miscCharges = EHR_BillingSchema.getInstance().getSchema().getTable(EHR_BillingSchema.TABLE_MISC_CHARGES);

        //create filters
        SimpleFilter invoiceRunFilter = new SimpleFilter(FieldKey.fromString("invoiceId"), pks, CompareType.IN);

        SimpleFilter miscChargesFilter = new SimpleFilter(FieldKey.fromString("invoiceId"), pks, CompareType.IN);

        //perform the work
        List<String> ret = new ArrayList<>();
        if (testOnly)
        {
            TableSelector tsRuns = new TableSelector(invoicedItems, invoiceRunFilter, null);
            ret.add(tsRuns.getRowCount() + " records from invoiced items");

            TableSelector tsMiscCharges2 = new TableSelector(miscCharges, miscChargesFilter, null);
            ret.add(tsMiscCharges2.getRowCount() + " records from misc charges will be removed from the deleted invoice, which means they will be picked up by the next billing period.  They are not deleted.");
        }
        else
        {
            try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
            {
                long deleted1 = Table.delete(invoicedItems, invoiceRunFilter);

                TableSelector tsMiscCharges2 = new TableSelector(miscCharges, Collections.singleton("objectid"), miscChargesFilter, null);
                String[] miscChargesIds = tsMiscCharges2.getArray(String.class);
                for (String objectid : miscChargesIds)
                {
                    Map<String, Object> map = new CaseInsensitiveHashMap<>();
                    map.put("invoiceId", null);
                    map = Table.update(user, miscCharges, map, objectid);
                }

                long deleted3 = Table.delete(invoiceRuns, new SimpleFilter(FieldKey.fromString("objectid"), pks, CompareType.IN));

                transaction.commit();
            }
        }

        return ret;
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