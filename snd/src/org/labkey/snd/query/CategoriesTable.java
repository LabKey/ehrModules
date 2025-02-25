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
package org.labkey.snd.query;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema.SimpleTable;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.snd.SNDSequencer;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Created by marty on 8/27/2017.
 */
public class CategoriesTable extends SimpleTable<SNDUserSchema>
{

    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     * @param schema
     * @param table
     */
    public CategoriesTable(SNDUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public SimpleTable<SNDUserSchema> init()
    {
        super.init();

        SQLFragment inUseSql = new SQLFragment();
        inUseSql.append("(CASE WHEN EXISTS (SELECT PkgId FROM ");
        inUseSql.append(SNDSchema.getInstance().getTableInfoPkgCategoryJunction(), "pcj");
        inUseSql.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".CategoryId = pcj.CategoryId)");
        inUseSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn inUseCol = new ExprColumn(this, "InUse", inUseSql, JdbcType.BOOLEAN);
        addColumn(inUseCol);

        return this;
    }

    protected boolean isCategoryInUse(Container c, User u, int catId)
    {
        TableSelector ts = new TableSelector(this, Collections.singleton("InUse"), new SimpleFilter(FieldKey.fromString("CategoryId"), catId), null);
        Boolean[] ret = ts.getArray(Boolean.class);

        return ret[0];
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new CategoriesTable.UpdateService(this);
    }

    protected class UpdateService extends SimpleQueryUpdateService
    {
        public UpdateService(SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        @Override
        protected Map<String, Object> deleteRow(User user, Container container, Map<String, Object> oldRowMap) throws QueryUpdateServiceException, SQLException, InvalidKeyException
        {
            int categoryId = (Integer) oldRowMap.get("CategoryId");
            if (isCategoryInUse(container, user, categoryId))
                throw new QueryUpdateServiceException("Category in use, cannot delete.");

            return super.deleteRow(user, container, oldRowMap);
        }

        private Map<String, Object> ensureCategoryId(Container container, Map<String, Object> row)
        {
            Object id;
            Integer intId = null;
            id = row.get("CategoryId");
            if (id == null)
                id = row.get("categoryId");

            if (id != null)
            {
                if (id.getClass() == String.class)
                {
                    intId = Integer.parseInt((String) id);
                }
                else
                {
                    intId = (Integer) id;
                }
            }

            row.put("CategoryId", SNDSequencer.CATEGORYID.ensureId(container, intId));

            return row;
        }

        @Override
        public List<Map<String, Object>> insertRows(User user, Container container, List<Map<String, Object>> rows, BatchValidationException errors, @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
                throws DuplicateKeyException, QueryUpdateServiceException, SQLException
        {
            for (Map<String, Object> row : rows)
            {
                ensureCategoryId(container, row);
            }

            return super.insertRows(user, container, rows, errors, configParameters, extraScriptContext);
        }

        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row)
                throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            ensureCategoryId(container, row);
            return super.insertRow(user, container, row);
        }
    }
}
