/*
 * Copyright (c) 2013-2016 LabKey Corporation
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
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.validator.ColumnValidator;
import org.labkey.api.data.validator.ColumnValidators;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.table.AbstractDataDefinedTable;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.RuntimeValidationException;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 1/31/13
 * Time: 4:33 PM
 */
public class LookupSetTable extends AbstractDataDefinedTable
{
    private static final String CACHE_KEY = LookupSetTable.class.getName() + "||values";

    private static final String FILTER_COL = "set_name";
    private static final String VALUE_COL = "value";

    private String _keyField;

    public static String getCacheKey(Container c)
    {
        return CACHE_KEY + "||" + c.getId();
    }

    public LookupSetTable(UserSchema schema, SchemaTableInfo table, String setName, Map<String, Object> map)
    {
        super(schema, table, FILTER_COL, VALUE_COL, setName, setName);

        setTitleColumn(VALUE_COL);

        if (map.containsKey("label"))
            setTitle((String)map.get("label"));

        if (map.containsKey("description"))
            setDescription((String) map.get("description"));

        if (map.containsKey("keyField") && map.get("keyField") != null)
            _keyField = (String)map.get("keyField");

        if (map.containsKey("titleColumn") && map.get("titleColumn") != null)
            _titleColumn = (String)map.get("titleColumn");
        else
            _titleColumn = VALUE_COL;
    }

    public LookupSetTable init()
    {
        super.init();

        if (_keyField != null)
        {
            ColumnInfo keyCol = getColumn(_keyField);
            if (keyCol != null)
            {
                keyCol.setKeyField(true);
                getColumn("rowid").setKeyField(false);
            }
        }
        else
        {
            getColumn(VALUE_COL).setKeyField(false);
            getColumn("rowid").setKeyField(true);
        }

        if (_titleColumn != null)
        {
            ColumnInfo titleCol = getColumn(_titleColumn);
            if (titleCol != null)
            {
                setTitleColumn(titleCol.getName());
            }
        }
        LDKService.get().getDefaultTableCustomizer().customize(this);
        return this;
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new LookupSetTable.EHRLookupsUpdateService(this);
    }

    protected class EHRLookupsUpdateService extends UpdateService
    {
        public EHRLookupsUpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti);
        }

        private void validateValue(Map<String, Object> row)
        {
            for (ColumnInfo col : getQueryTable().getColumns())
            {
                if (row.keySet().contains(col.getColumnName()))
                {
                    Object value = row.get(col.getColumnName());

                    List<ColumnValidator> validators = ColumnValidators.create(col, null);
                    for (ColumnValidator v : validators)
                    {
                        String msg = v.validate(1, value);
                        if (msg != null)
                            throw new RuntimeValidationException(msg, col.getName());
                    }
                }
            }
        }


        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            validateValue(row);
            return super.insertRow(user, container, row);
        }

        @Override
        protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, @NotNull Map<String, Object> oldRow) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            validateValue(row);
            return super.updateRow(user, container, row, oldRow);
        }


    }
}


