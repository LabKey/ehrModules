/*
 * Copyright (c) 2017-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.ehr.model;


import org.labkey.api.data.Container;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.data.xml.domainTemplate.DomainTemplateType;
import org.labkey.data.xml.domainTemplate.EHRTemplateType;


import java.util.List;
import java.util.Set;

public class EHRDomainKind extends ExtendedTableDomainKind
{
    public static final String KIND_NAME = "EHR";

    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("EHRDomainKind.canCreateDefinition", user, AdminPermission.class);
    }

    public static Container getDomainContainer(Container c)
    {
        return c;
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
    public Set<String> getReservedPropertyNames(Domain domain, User user)
    {
        return super.getReservedPropertyNames(domain, user);
    }

    @Override
    public boolean matchesTemplateXML(String templateName, DomainTemplateType template, List<GWTPropertyDescriptor> properties)
    {
        return template instanceof EHRTemplateType;
    }
}

