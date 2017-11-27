package org.labkey.ehr.query;

import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleTableDomainKind;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.ehr.model.EHRDomainKind;
import org.labkey.ehr.model.EHRDomainUpdateHelper;

public class EHRExtensibleTable<SchemaType extends UserSchema> extends SimpleUserSchema.SimpleTable<SchemaType>
{
    public EHRExtensibleTable(SchemaType schema, TableInfo table)
    {
        super(schema, table);
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

    public QueryUpdateService getUpdateService()
    {
        TableInfo table = getRealTable();
        if (table != null)
            return new SimpleQueryUpdateService(this, table, new EHRDomainUpdateHelper(this));

        return null;
    }
}
