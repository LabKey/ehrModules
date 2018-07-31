package org.labkey.ehr.query;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRDataAdminPermission;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.query.SimpleTableDomainKind;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.ehr.model.EHR_LookupsDomainKind;

public class EHR_LookupsExtensibleTable<SchemaType extends UserSchema> extends EHRExtensibleTable<SchemaType>
{
    public EHR_LookupsExtensibleTable(SchemaType schema, TableInfo table)
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

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        return perm.equals(EHRDataAdminPermission.class)  &&
                getContainer().hasPermission(user, perm);
    }

}
