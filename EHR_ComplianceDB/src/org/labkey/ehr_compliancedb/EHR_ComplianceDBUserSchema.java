/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.ehr_compliancedb;

import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.module.Module;
import org.labkey.api.query.DefaultSchema;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

/**
 * User: bimber
 * Date: 9/24/13
 * Time: 9:07 PM
 */
public class EHR_ComplianceDBUserSchema extends SimpleUserSchema
{
    public static final String TABLE_REQUIREMENTS = "requirements";

    public EHR_ComplianceDBUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(EHR_ComplianceDBModule.SCHEMA_NAME, null, user, container, dbschema);
    }

    @Override
    public TableInfo createTable(String name)
    {
        if (TABLE_REQUIREMENTS.equalsIgnoreCase(name))
        {
            SchemaTableInfo table = _dbSchema.getTable(name);
            return new ContainerScopedTable(this, table, "requirementname").init();
        }

        return super.createTable(name);
    }

    public static void register(final Module m)
    {
        final DbSchema dbSchema = DbSchema.get(EHR_ComplianceDBModule.SCHEMA_NAME, DbSchemaType.Module);

        DefaultSchema.registerProvider(EHR_ComplianceDBModule.SCHEMA_NAME, new DefaultSchema.SchemaProvider(m)
        {
            public QuerySchema createSchema(final DefaultSchema schema, Module module)
            {
                return new EHR_ComplianceDBUserSchema(schema.getUser(), schema.getContainer(), dbSchema);
            }
        });
    }

}
