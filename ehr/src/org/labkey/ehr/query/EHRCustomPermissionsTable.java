package org.labkey.ehr.query;

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.ldk.table.CustomPermissionsTable;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleTableDomainKind;
import org.labkey.api.query.UserSchema;
import org.labkey.ehr.model.EHRDomainKind;
import org.labkey.ehr.model.EHRDomainUpdateHelper;

public class EHRCustomPermissionsTable<SchemaType extends UserSchema> extends CustomPermissionsTable<SchemaType>
{
    public EHRCustomPermissionsTable(SchemaType schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);

        setAllowedInsertOption(QueryUpdateService.InsertOption.MERGE);
        setAllowedInsertOption(QueryUpdateService.InsertOption.REPLACE);
        setAllowedInsertOption(QueryUpdateService.InsertOption.UPSERT);
    }

    @Override
    public SimpleTableDomainKind getDomainKind()
    {
        if (getObjectUriColumn() == null)
            return null;

        return (EHRDomainKind) PropertyService.get().getDomainKindByName(EHRDomainKind.KIND_NAME);
    }

    @Override
    protected Container getDomainContainer()
    {
        return EHRDomainKind.getDomainContainer(getContainer());
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        TableInfo table = getRealTable();
        if (table != null)
            return new SimpleQueryUpdateService(this, table, new EHRDomainUpdateHelper(this));

        return null;
    }
}
