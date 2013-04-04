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

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.DataLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.FileStream;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 1/31/13
 * Time: 4:33 PM
 */
public class LookupSetTable extends AbstractDataDefinedTable
{
    public static final String CACHE_KEY = LabworkTypeTable.class.getName() + "||values";

    private static final String FILTER_COL = "set_name";
    private static final String VALUE_COL = "value";

    public LookupSetTable(UserSchema schema, SchemaTableInfo table, String setName, Map<String, Object> map)
    {
        super(schema, table, FILTER_COL, VALUE_COL, setName, setName);

        if (map.containsKey("label"))
            setTitle((String)map.get("label"));

        if (map.containsKey("description"))
            setDescription((String) map.get("description"));

        if (map.containsKey("keyField") && map.get("keyField") != null)
        {
            ColumnInfo keyCol = getColumn((String)map.get("keyField"));
            if (keyCol != null)
            {
                keyCol.setKeyField(true);
                getColumn("rowid").setKeyField(false);
            }

        }

        setTitleColumn(VALUE_COL);
        if (map.containsKey("titleColumn") && map.get("titleColumn") != null)
        {
            ColumnInfo titleCol = getColumn((String)map.get("titleColumn"));
            if (titleCol != null)
            {
                setTitleColumn(titleCol.getName());
            }
        }
    }
}


