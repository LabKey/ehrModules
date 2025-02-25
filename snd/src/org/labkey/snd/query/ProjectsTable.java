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
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.DbScope;
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
import org.labkey.api.snd.SNDService;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;

import java.sql.SQLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class ProjectsTable extends SimpleTable<SNDUserSchema>
{

    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     * @param schema
     * @param table
     */
    public ProjectsTable(SNDUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public ProjectsTable init()
    {
        super.init();

        SQLFragment hasEventSql = new SQLFragment();
        hasEventSql.append("(CASE WHEN EXISTS (SELECT pr.ProjectId FROM ");
        hasEventSql.append(SNDSchema.getInstance().getTableInfoProjects(), "pr");
        hasEventSql.append(" JOIN ");
        hasEventSql.append(SNDSchema.getInstance().getTableInfoEvents(), "ev");
        hasEventSql.append(" ON pr.ObjectId = ev.ParentObjectId");
        hasEventSql.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".ProjectId = pr.ProjectId AND " + ExprColumn.STR_TABLE_ALIAS + ".RevisionNum = pr.RevisionNum)");
        hasEventSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn hasDataCol = new ExprColumn(this, "HasEvent", hasEventSql, JdbcType.BOOLEAN);
        addColumn(hasDataCol);

        return this;
    }

    public boolean isProjectInUse(int projectId, int revNum)
    {
        Set<String> cols = Collections.singleton("HasEvent");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("ProjectId"), projectId, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("RevisionNum"), revNum, CompareType.EQUAL);
        TableSelector ts = new TableSelector(this, cols, filter, null);
        Map<String, Object> ret = ts.getMap();

        return Boolean.parseBoolean((String) ret.get("HasEvent"));
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new ProjectsTable.UpdateService(this);
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
            int projectId = (Integer) oldRowMap.get("ProjectId");
            int revNum = (Integer) oldRowMap.get("RevisionNum");

            // Cannot delete in use project
            if (isProjectInUse(projectId, revNum))
                throw new QueryUpdateServiceException("Project in use, cannot delete.");

            // Can only delete the latest project
            if (!SNDManager.get().projectRevisionIsLatest(container, user, projectId, revNum))
                throw new QueryUpdateServiceException("Project is not the latest project, cannot delete.");

            UserSchema schema = SNDManager.getSndUserSchema(container, user);
            TableInfo projectItemsTable = getTableInfo(schema, SNDSchema.PROJECTITEMS_TABLE_NAME);
            QueryUpdateService projectItemsQus = getQueryUpdateService(projectItemsTable);

            try (DbScope.Transaction tx = SNDSchema.getInstance().getSchema().getScope().ensureTransaction(SNDService.get().getWriteLock()))
            {
                List<Map<String, Object>> rows = SNDManager.get().getProjectItems(container, user, projectId, revNum);
                try
                {
                    projectItemsQus.deleteRows(user, container, rows, null, null);
                }
                catch (BatchValidationException e)
                {
                    throw new QueryUpdateServiceException(e);
                }
                tx.commit();
            }

            // now delete package row
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
