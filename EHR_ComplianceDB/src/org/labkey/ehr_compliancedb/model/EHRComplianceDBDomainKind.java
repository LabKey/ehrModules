package org.labkey.ehr_compliancedb.model;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.data.xml.domainTemplate.DomainTemplateType;
import org.labkey.data.xml.domainTemplate.EHRComplianceDBTemplateType;


import java.util.List;
import java.util.Set;

public class EHRComplianceDBDomainKind extends ExtendedTableDomainKind
{
    public static final String KIND_NAME = "EHRComplianceDB";

    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("EHRComplianceDBDomainKind.canCreateDefinition", user, AdminPermission.class);
    }

    @Override
    protected String getSchemaName()
    {
        return KIND_NAME.toLowerCase();
    }

    @Override
    protected String getNamespacePrefix()
    {
        return KIND_NAME.toLowerCase();
    }

    @Override
    public String getKindName()
    {
        return KIND_NAME;
    }

    @Override
    public @NotNull Set<String> getReservedPropertyNames(Domain domain, User user)
    {
        return super.getReservedPropertyNames(domain, user);
    }

    @Override
    public boolean matchesTemplateXML(String templateName, DomainTemplateType template, List<GWTPropertyDescriptor> properties)
    {
        return template instanceof EHRComplianceDBTemplateType;
    }
}


