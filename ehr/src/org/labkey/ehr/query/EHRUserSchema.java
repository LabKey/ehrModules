/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.query;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.TableInfo;
import org.labkey.api.module.Module;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.ehr.EHRSchema;

/**
 * User: bimber
 * Date: 8/6/13
 * Time: 7:21 PM
 */
public class EHRUserSchema extends SimpleUserSchema
{
    public EHRUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(EHRSchema.EHR_SCHEMANAME, null, user, container, dbschema);
    }

    @Override
    @Nullable
    protected TableInfo createWrappedTable(String name, @NotNull TableInfo schemaTable)
    {
        if (EHRSchema.TABLE_REQUESTS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else if (EHRSchema.TABLE_TASKS.equalsIgnoreCase(name))
            return getDataEntryTable(schemaTable);
        else
            return super.createWrappedTable(name, schemaTable);
    }

    private TableInfo getDataEntryTable(TableInfo schemaTable)
    {
        return new DataEntryTable(this, schemaTable).init();
    }
}
