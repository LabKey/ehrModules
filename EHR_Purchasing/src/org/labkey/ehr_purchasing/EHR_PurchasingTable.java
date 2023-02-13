package org.labkey.ehr_purchasing;

import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.DatabaseTableType;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.SimpleQueryUpdateService;

public class EHR_PurchasingTable extends SimpleUserSchema.SimpleTable<EHR_PurchasingUserSchema>
{
    public EHR_PurchasingTable(EHR_PurchasingUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        if (!isReadOnly())
        {
            TableInfo table = getRealTable();
            if (table != null && table.getTableType() == DatabaseTableType.TABLE)
                return new SimpleQueryUpdateService(this, table)
                {
                    @Override
                    protected boolean supportUpdateUsingDIB()
                    {
                        // ehr_purchasing.purchasingRequests has a custom query definition in wnprc_purchusing that adds special calculated columns.
                        // The email notifications sent are dependent on those calculated columns, which aren't returned by updateRows using data iterator / prepared statement
                        return false;
                    }
                };
        }
        return null;
    }
}
