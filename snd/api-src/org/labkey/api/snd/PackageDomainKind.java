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

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerType;
import org.labkey.api.exp.XarContext;
import org.labkey.api.exp.XarFormatException;
import org.labkey.api.exp.xar.LsidUtils;
import org.labkey.api.module.SimpleModule;
import org.labkey.api.query.ExtendedTableDomainKind;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.AdminPermission;

/**
 * Created by marty on 8/14/2017.
 */
public class PackageDomainKind extends ExtendedTableDomainKind
{
    private static final String NAMESPACE_PREFIX = "package";
    private static final String SCHEMA_NAME = "snd";
    private static final String KIND_NAME = "Package";

    private static final String DOMAIN_NAMESPACE_PREFIX_TEMPLATE = NAMESPACE_PREFIX + "-${SchemaName}";

    @Override
    public boolean canCreateDefinition(User user, Container container)
    {
        return container.hasPermission("PackageDomainKind.canCreateDefinition", user, AdminPermission.class);
    }

    @Override
    public String generateDomainURI(String schemaName, String tableName, Container c, User u)
    {
        return getDomainURI(schemaName, tableName, c, u);
    }

    public static String getDomainURI(String schemaName, String tableName, Container c, User u)
    {
        try
        {
            XarContext xc = getXarContext(schemaName, tableName, c.getContainerFor(ContainerType.DataType.domainDefinitions), u);
            return LsidUtils.resolveLsidFromTemplate(SimpleModule.DOMAIN_LSID_TEMPLATE, xc, DOMAIN_NAMESPACE_PREFIX_TEMPLATE);
        }
        catch (XarFormatException xfe)
        {
            return null;
        }
    }

    @Override
    protected String getSchemaName()
    {
        return getPackageSchemaName();
    }

    public static String getPackageSchemaName()
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
        return getPackageKindName();
    }

    public static String getPackageKindName()
    {
        return KIND_NAME;
    }
}
