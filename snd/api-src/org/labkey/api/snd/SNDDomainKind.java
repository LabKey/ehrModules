/*
 * Copyright (c) 2017-2018 LabKey Corporation
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
package org.labkey.api.snd;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.settings.AppProps;
import org.labkey.data.xml.domainTemplate.DomainTemplateType;
import org.labkey.data.xml.domainTemplate.SNDTemplateType;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by marty on 7/11/2017.
 */
public class SNDDomainKind extends ExtendedTableDomainKind
{
    private final String NAMESPACE_PREFIX = "snd";
    private final String SCHEMA_NAME = "snd";
    private final String KIND_NAME = "SND";


    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("SNDDomainKind.canCreateDefinition", user, AdminPermission.class);
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
    public boolean ensurePropertyLookup()
    {
        return true;
    }

    @Override
    public Set<String> getReservedPropertyNames(Domain domain, User user)
    {
        Set<String> result = new HashSet<>();
        result.add("Description");
        result.add("Active");
        result.add("ObjectId");
        result.add("QcState");
        result.add("Container");
        result.add("CreatedBy");
        result.add("Created");
        result.add("ModifiedBy");
        result.add("Modified");
        return result;
    }

    @Override
    public boolean matchesTemplateXML(String templateName, DomainTemplateType template, List<GWTPropertyDescriptor> properties)
    {
        return template instanceof SNDTemplateType;
    }


    public static String formatSndDomainURI(int containerRowId, int packageId)
    {
        return String.format("urn:lsid:%s:package-snd.Folder-%d:Package-%d",
                AppProps.getInstance().getDefaultLsidAuthority(),
                containerRowId,
                packageId);
    }

    public static SQLFragment likeSndDomainURI(Integer containerRowId, Integer packageId)
    {
        String pattern = String.format("urn:lsid:%s:package-snd.Folder-%s:Package-%s",
                CompareType.escapeLikePattern(AppProps.getInstance().getDefaultLsidAuthority(), '!'),
                null==containerRowId ? "%" : Integer.toString(containerRowId),
                null==packageId ? "%" : Integer.toString(packageId)
        );
        return new SQLFragment("LIKE ").appendValue(pattern).append(" ESCAPE '!'");
    }
}
