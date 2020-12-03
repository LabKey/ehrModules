/*
 * Copyright (c) 2020 LabKey Corporation
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
package org.labkey.api.ehr_purchasing;

import org.labkey.api.data.Container;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.data.xml.domainTemplate.DomainTemplateType;
import org.labkey.data.xml.domainTemplate.EHRPurchasingTemplateType;

import java.util.List;

/**
 *  Defines a DomainKind to allow tables in ehr_purchasing schema to be extensible.
 *  Ensure that tables to be extended has a LSID column - this is a requirement to make tables extensible.
 */
public class EHR_PurchasingDomainKind extends ExtendedTableDomainKind
{
    private final String NAMESPACE_PREFIX = "ehr_purchasing";
    private final String SCHEMA_NAME = "ehr_purchasing";
    private final String KIND_NAME = "EHR_Purchasing";

    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("EHR_PurchasingDomainKind.canCreateDefinition", user, AdminPermission.class);
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
    public boolean matchesTemplateXML(String templateName, DomainTemplateType template, List<GWTPropertyDescriptor> properties)
    {
        return template instanceof EHRPurchasingTemplateType; //EHRPurchasingTemplateType is a bean generated from domainTemplate.xsd
    }
}