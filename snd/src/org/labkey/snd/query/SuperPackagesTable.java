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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema.SimpleTable;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.snd.SuperPackage;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * Created by marty on 8/23/2017.
 */
public class SuperPackagesTable extends AbstractSNDTableInfo
{

    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     * @param schema
     * @param table
     */
    public SuperPackagesTable(SNDUserSchema schema, TableInfo table)
    {
        super(schema, table);
    }

    @Override
    public SuperPackagesTable init()
    {
        super.init();

        SQLFragment hasDataSql = new SQLFragment();
        hasDataSql.append("(CASE WHEN EXISTS (SELECT " + ExprColumn.STR_TABLE_ALIAS + ".SuperPkgId FROM ");
        hasDataSql.append(SNDSchema.getInstance().getTableInfoEventData(), "ce");
        hasDataSql.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".SuperPkgId = ce.SuperPkgId)");
        hasDataSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn hasDataCol = new ExprColumn(this, "HasEvent", hasDataSql, JdbcType.BOOLEAN);
        addColumn(hasDataCol);

        SQLFragment inUseSql = new SQLFragment();
        inUseSql.append("(CASE WHEN EXISTS (SELECT " + ExprColumn.STR_TABLE_ALIAS + ".SuperPkgId FROM ");
        inUseSql.append(SNDSchema.getInstance().getTableInfoProjectItems(), "pi");
        inUseSql.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".SuperPkgId = pi.SuperPkgId)");
        inUseSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn inUseCol = new ExprColumn(this, "HasProject", inUseSql, JdbcType.BOOLEAN);
        addColumn(inUseCol);

        SQLFragment isPrimitiveSql = new SQLFragment();
        isPrimitiveSql.append("(CASE WHEN NOT EXISTS (SELECT sp.ParentSuperPkgId FROM ");
        isPrimitiveSql.append(SNDSchema.getInstance().getTableInfoSuperPkgs(), "sp");
        isPrimitiveSql.append(" WHERE sp.ParentSuperPkgId = " + ExprColumn.STR_TABLE_ALIAS + ".SuperPkgId)");
        isPrimitiveSql.append(" AND " + ExprColumn.STR_TABLE_ALIAS + ".ParentSuperPkgId IS NULL");
        isPrimitiveSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn isPrimitiveCol = new ExprColumn(this, "IsPrimitive", isPrimitiveSql, JdbcType.BOOLEAN);
        isPrimitiveCol.setDescription("A super package with a null ParentSuperPkgId and is not a parent of any other super package.");
        addColumn(isPrimitiveCol);

        return this;
    }

    public boolean isPackageInUse(int superPkgId)
    {
        Set<String> cols = Collections.singleton("HasEvent");
        TableSelector ts = new TableSelector(this, cols, new SimpleFilter(FieldKey.fromString("SuperPkgId"), superPkgId), null);
        Map<String, Object> map = ts.getMap();

        return Boolean.parseBoolean((String) map.get("HasEvent"));
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new SuperPackagesTable.UpdateService(this);
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
            int superPkgId = (Integer) oldRowMap.get("SuperPkgId");
            if (isPackageInUse(superPkgId))
                throw new QueryUpdateServiceException("Package in use, cannot delete.");

            // if top-level super package
            if (oldRowMap.get("ParentSuperPkgId") == null)
            {
                // then delete all child super packages pointing to this top-level super package
                List<SuperPackage> childSuperPackages = SNDManager.getChildSuperPkgs(container, user, superPkgId);
                if (childSuperPackages != null)
                {
                    for (SuperPackage childSuperPackage : childSuperPackages)
                    {
                        Map<String, Object> superPackageRow = new HashMap<>(1);
                        superPackageRow.put("SuperPkgId", childSuperPackage.getSuperPkgId());
                        super.deleteRow(user, container, superPackageRow);
                    }
                }
            }

            // Delete project items associated with the super package
            List<Integer> projItemIds = SNDManager.getProjectItemIdsForSuperPkgId(container, user, superPkgId);
            List<Map<String, Object>> projItemRows = new ArrayList<>();

            UserSchema schema = SNDManager.getSndUserSchema(container, user);
            TableInfo projItemsTable = getTableInfo(schema, SNDSchema.PROJECTITEMS_TABLE_NAME);
            QueryUpdateService projItemsQus = getQueryUpdateService(projItemsTable);

            if (projItemIds != null)
            {
                for (Integer projItemId : projItemIds)
                {
                    Map<String, Object> projItemRow = new HashMap<>();
                    projItemRow.put("ProjectItemId", projItemId);
                    projItemRows.add(projItemRow);
                }
                try
                {
                    projItemsQus.deleteRows(user, container, projItemRows, null, null);
                }
                catch (BatchValidationException e)
                {
                    throw new QueryUpdateServiceException(e);
                }
            }

            return super.deleteRow(user, container, oldRowMap);
        }

        private TableInfo getTableInfo(@NotNull UserSchema schema, @NotNull String table)
        {
            TableInfo tableInfo = schema.getTable(table);
            if (tableInfo == null)
                throw new IllegalStateException(table + " TableInfo not found");

            return tableInfo;
        }

        private QueryUpdateService getQueryUpdateService(@NotNull TableInfo table)
        {
            QueryUpdateService qus = table.getUpdateService();
            if (qus == null)
                throw new IllegalStateException(table.getName() + " query update service");

            return qus;
        }

    }
}
