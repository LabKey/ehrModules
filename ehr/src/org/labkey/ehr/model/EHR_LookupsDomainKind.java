package org.labkey.ehr.model;

import org.labkey.api.data.Container;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.data.xml.domainTemplate.DomainTemplateType;
import org.labkey.data.xml.domainTemplate.EHRLookupsTemplateType;

import java.util.List;

public class EHR_LookupsDomainKind extends EHRDomainKind
{
    public static final String KIND_NAME = "EHR_Lookups";

    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("EHR_LookupsDomainKind.canCreateDefinition", user, AdminPermission.class);
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
    public boolean matchesTemplateXML(String templateName, DomainTemplateType template, List<GWTPropertyDescriptor> properties)
    {
        return template instanceof EHRLookupsTemplateType;
    }
}
