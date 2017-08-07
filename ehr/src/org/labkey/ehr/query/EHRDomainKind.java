package org.labkey.ehr.query;


import org.labkey.api.data.Container;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;

import java.util.Set;

public class EHRDomainKind extends ExtendedTableDomainKind
{

    private final String NAMESPACE_PREFIX = "ehr";
    private final String SCHEMA_NAME = "ehr";
    public static final String KIND_NAME = "EHR";


    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("EHRDomainKind.canCreateDefinition", user, AdminPermission.class);
    }

    public static Container getDomainContainer(Container c)
    {
        if (c != null)
            return c.getProject();

        return c;
    }

    @Override
    protected String getSchemaName()
    {
        return SCHEMA_NAME;
    }

    @Override
    protected String getNamespacePrefix()
    {
        return NAMESPACE_PREFIX;
    }

    @Override
    public String getKindName()
    {
        return KIND_NAME;
    }

    @Override
    public Set<String> getReservedPropertyNames(Domain domain)
    {
        return super.getReservedPropertyNames(domain);
    }
}

