package org.labkey.ehr.query;

import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.query.SimpleTableDomainKind;
import org.labkey.api.query.UserSchema;
import org.labkey.ehr.model.EHR_LookupsDomainKind;

public class EHR_LookupsContainerScopedTable<SchemaType extends UserSchema> extends EHRContainerScopedTable<SchemaType>
{
    public EHR_LookupsContainerScopedTable(SchemaType schema, TableInfo table, String newPk)
    {
        super(schema, table, newPk);
    }

    @Override
    public SimpleTableDomainKind getDomainKind()
    {
        if (getObjectUriColumn() == null)
            return null;

        return (EHR_LookupsDomainKind) PropertyService.get().getDomainKindByName(EHR_LookupsDomainKind.KIND_NAME);
    }
}
