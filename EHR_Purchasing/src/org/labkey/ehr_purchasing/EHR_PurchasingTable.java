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
        // UNDONE: add an 'isUserEditable' bit to the schema and table?
        if (!isReadOnly())
        {
            TableInfo table = getRealTable();
            if (table != null && table.getTableType() == DatabaseTableType.TABLE)
                return new SimpleQueryUpdateService(this, table)
                {
                    @Override
                    protected boolean supportUpdateUsingDIB()
                    {
                        return false;
                    }
                };
        }
        return null;
    }
}
