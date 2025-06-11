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
import org.labkey.api.data.TableInfo;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleUserSchema.SimpleTable;
import org.labkey.api.security.User;
import org.labkey.api.snd.SNDDomainKind;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

public class LookupsTable extends SimpleTable<SNDUserSchema>
{
    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     */
    public LookupsTable(SNDUserSchema schema, TableInfo table, ContainerFilter cf)
    {
        super(schema, table, cf);
    }

    @Override
    public LookupsTable init() {
        super.init();

        SQLFragment isInUseQuery = new SQLFragment();
        isInUseQuery.append("(CASE WHEN EXISTS (SELECT l.Value FROM ");
        isInUseQuery.append(SNDSchema.getInstance().getTableInfoLookups(), "l");
        isInUseQuery.append(" INNER JOIN ");
        isInUseQuery.append(SNDSchema.getInstance().getTableInfoLookupSets(), "ls");
        isInUseQuery.append(" ON l.LookupSetId = ls.LookupSetId ");
        isInUseQuery.append(" INNER JOIN ");
        isInUseQuery.append(OntologyManager.getTinfoPropertyDescriptor(), "pd");
        isInUseQuery.append(" ON ls.SetName = pd.LookupQuery ");
        isInUseQuery.append(" AND pd.PropertyURI ").append(SNDDomainKind.likeSndDomainURI(null,null));
        isInUseQuery.append(" INNER JOIN  ");
        isInUseQuery.append(OntologyManager.getTinfoObjectProperty(), "op");
        isInUseQuery.append(" ON op.PropertyId = pd.PropertyId ");
        isInUseQuery.append(" WHERE CAST(" + ExprColumn.STR_TABLE_ALIAS + ".LookupId AS FLOAT) = op.FloatValue) ");
        isInUseQuery.append(" THEN 'true' else 'false' END)");
        ExprColumn isInUseColumn = new ExprColumn(this, "IsInUse", isInUseQuery, JdbcType.BOOLEAN);
        addColumn(isInUseColumn);

        return this;
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new UpdateService(this);
    }

    protected static class UpdateService extends SNDQueryUpdateService
    {
        public UpdateService(SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        @Override
        public int mergeRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                             @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
        {
            int result = super.mergeRows(user, container, rows, errors, configParameters, extraScriptContext);
            SNDManager.get().getCache().clear();
            return result;
        }

        @Override
        public int importRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                              @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
        {
            int result = super.importRows(user, container, rows, errors, configParameters, extraScriptContext);
            SNDManager.get().getCache().clear();
            return result;
        }

        @Override
        public List<Map<String, Object>> deleteRows(User user, Container container, List<Map<String, Object>> oldRows,
                                                    @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                throws InvalidKeyException, BatchValidationException, QueryUpdateServiceException, SQLException
        {
            List<Map<String, Object>> result = super.deleteRows(user, container, oldRows, configParameters, extraScriptContext);
            SNDManager.get().getCache().clear();
            return result;
        }

        @Override
        public int truncateRows(User user, Container container, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                throws BatchValidationException, QueryUpdateServiceException, SQLException
        {
            int result = super.truncateRows(user, container, configParameters, extraScriptContext);
            SNDManager.get().getCache().clear();
            return result;
        }
    }
}
