/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
package org.labkey.api.ehr.demographics;

import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;

abstract public class AbstractProjectValidator implements ProjectValidator
{
    public AbstractProjectValidator()
    {}

    public TableInfo getTableInfo(Container c, User u, String schemaName, String queryName)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, schemaName);
        if (us == null)
        {
            throw new IllegalArgumentException("Schema " + schemaName + " not found in the container: " + c.getPath());
        }

        final TableInfo ti = us.getTable(queryName);
        if (ti == null)
        {
            throw new IllegalArgumentException("Table: " + schemaName + "." + queryName + " not found in the container: " + c.getPath());
        }

        return ti;
    }

}
