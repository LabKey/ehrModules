package org.labkey.api.ehr_billing;

import org.labkey.api.data.Container;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;

import java.util.HashSet;
import java.util.Set;

public class EHR_BillingDomainKind extends ExtendedTableDomainKind
{
    private final String NAMESPACE_PREFIX = "ehr_billing";
    private final String SCHEMA_NAME = "ehr_billing";
    private final String KIND_NAME = "EHR_Billing";

    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("EHR_BillingDomainKind.canCreateDefinition", user, AdminPermission.class);
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
        Set<String> result = new HashSet<>();

        result.add("Container");
        result.add("CreatedBy");
        result.add("Created");
        result.add("ModifiedBy");
        result.add("Modified");
        return result;
    }
}