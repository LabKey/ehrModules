package org.labkey.ehr.query;

import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.query.SimpleTableDomainKind;
import org.labkey.api.query.UserSchema;
import org.labkey.ehr.model.EHR_LookupsDomainKind;

public class EHR_LookupsCustomPermissionsTable<SchemaType extends UserSchema> extends EHRCustomPermissionsTable<SchemaType>
{
    public EHR_LookupsCustomPermissionsTable(SchemaType schema, TableInfo table)
    {
        super(schema, table);
    }

    @Override
    public SimpleTableDomainKind getDomainKind()
    {
        if (getObjectUriColumn() == null)
            return null;

        return (EHR_LookupsDomainKind) PropertyService.get().getDomainKindByName(EHR_LookupsDomainKind.KIND_NAME);
    }
}