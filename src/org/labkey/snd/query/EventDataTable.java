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

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.TableInfo;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.dataiterator.ListofMapsDataIterator;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.OntologyObject;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.settings.AppProps;
import org.labkey.api.snd.SNDDomainKind;
import org.labkey.api.snd.SNDService;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDUserSchema;
import org.labkey.snd.security.permissions.SNDViewerPermission;

import java.io.IOException;
import java.sql.SQLException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EventDataTable extends AbstractSNDTableInfo
{
    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     * @param schema
     * @param table
     */
    public EventDataTable(SNDUserSchema schema, TableInfo table)
    {
        super(schema, table);
    }

    public void addColumns()
    {
        BaseColumnInfo objectid = new BaseColumnInfo("ObjectId", this, JdbcType.INTEGER)
        {
            @Override
            public SQLFragment getValueSql(String tableAliasName)
            {
                return new SQLFragment(tableAliasName).append(".").append("ObjectId");
            }
        };
        objectid.setHidden(true);
        objectid.setFk(new BaseColumnInfo.SchemaForeignKey(objectid, "exp", "Object", "ObjectId", false));
        // SimpleTableSchema.SimpleTable.wrapColumn() is weird. It calls addColumn() which is not the usual pattern.
        fixupWrappedColumn(objectid, objectid);
        addColumn(objectid);
        super.addColumns();
    }

    @Override
    public @NotNull SQLFragment getFromSQL(String alias)
    {
        SQLFragment table = super.getFromSQL("_evnt_data_");
        SQLFragment join = new SQLFragment("(SELECT _evnt_data_.*, ObjectId FROM ")
                .append(table).append(" INNER JOIN exp.Object ON _evnt_data_.ObjectURI = Object.ObjectURI").append(") ").append(alias);
        return join;
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        return getContainer().hasPermission(user, SNDViewerPermission.class, getUserSchema().getContextualRoles());
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new EventDataTable.UpdateService(this);
    }

    protected class UpdateService extends SNDQueryUpdateService
    {
        private final SNDManager _sndManager = SNDManager.get();
        private final SNDService _sndService = SNDService.get();
        private final DbSchema _expSchema = OntologyManager.getExpSchema();

        public UpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        private String getObjectURI(Integer eventDataId, Container c)
        {
            return _sndManager.generateLsid(c, String.valueOf(eventDataId));
        }

        @Override
        public int mergeRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                             @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
        {
            List<Map<String, Object>> data;
            DataIteratorContext dataIteratorContext = getDataIteratorContext(errors, InsertOption.MERGE, configParameters);
            Set<Integer> eventIds = new HashSet<>();

            Logger log = SNDManager.getLogger(configParameters, EventDataTable.class);

            try
            {
                data = _sndService.getMutableData(rows, dataIteratorContext);
            }
            catch (IOException e)
            {
                return 0;
            }
            // Large merge triggers importRows path
            if (data.size() >= SNDManager.MAX_MERGE_ROWS)
            {
                log.info("More than " + SNDManager.MAX_MERGE_ROWS + " rows. using importRows method.");
                return importRows(user, container, rows, errors, configParameters, extraScriptContext);
            }

            log.info("Merging rows.");

            log.info("Begin updating exp.Object table.");
            int count = 0;
            for(Map<String, Object> map : data)
            {
                String objectURI = getObjectURI((Integer) map.get("EventDataId"), container);

                //update snd.EventData row with objectURI
                map.put("ObjectURI", objectURI);

                //delete row from exp.Object
                OntologyManager.deleteOntologyObjects(container, objectURI);

                //add updated row to exp.Object
                OntologyManager.ensureObject(container, objectURI);

                //add to list of cached narrative rows to delete
                eventIds.add((Integer) map.get("EventId"));

                count++;
                //TODO: Count in exp.Object is not going to be the same as in snd.EventData - need to figure out how to get the count to log
                if(count % 1000 == 0)
                    log.info("Updated " + count + " rows in exp.Object table.");
            }
            log.info("End updating exp.Object table. Updated total of " + count + " rows.");

            int rowCount = 0;
            if(data.size() > 0 && null != data.get(0))
            {
                DataIteratorBuilder rowsWithObjectURI = new ListofMapsDataIterator.Builder(data.get(0).keySet(), data);
                rowCount = _importRowsUsingDIB(user, container, rowsWithObjectURI, null, dataIteratorContext, extraScriptContext);
            }

            _sndManager.updateNarrativeCache(container, user, eventIds, log);

            return rowCount; //there aren't any rows to merge
        }

        @Override
        public int importRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                              @Nullable Map<Enum,Object> configParameters, Map<String, Object> extraScriptContext)
        {
            List<Map<String, Object>> data;
            Set<Integer> cacheData = new HashSet<>();

            Logger log = SNDManager.getLogger(configParameters, EventDataTable.class);

            try
            {
                data = _sndService.getMutableData(rows, getDataIteratorContext(errors, InsertOption.IMPORT, configParameters));
            }
            catch (IOException e)
            {
                log.error(e.getMessage(), e);
                return 0;
            }

            log.info("Begin inserting into exp.Object.");
            int count = 0;
            for(Map<String, Object> map : data)
            {
                String objectURI = getObjectURI((Integer) map.get("EventDataId"), container);

                //update snd.EventData row with objectURI
                map.put("ObjectURI", objectURI);

                //add new row to exp.Object
                OntologyManager.ensureObject(container, objectURI);

                //add to list of cached narrative rows to delete
                cacheData.add((Integer) map.get("EventId"));

                count++;
                //TODO: Count in exp.Object is not going to be the same as in snd.EventData - need to figure out how to get the count to log
                if(count % 1000 == 0)
                    log.info("Inserted " + count + " rows in exp.Object table.");
            }
            log.info("End inserting into exp.Object. Inserted total of " + count + " rows.");

            DataIteratorBuilder rowsWithObjectURI = new ListofMapsDataIterator.Builder(data.get(0).keySet(), data);

            _sndManager.updateNarrativeCache(container, user, cacheData, log);

            //insert into snd.EventData (which includes extensible columns for EventData)
            return super.importRows(user, container, rowsWithObjectURI, errors, configParameters, extraScriptContext);
        }

        @Override
        public List<Map<String, Object>> deleteRows(User user, Container container, List<Map<String, Object>> oldRows,
                                                    @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                throws InvalidKeyException, BatchValidationException, QueryUpdateServiceException, SQLException
        {
            Logger log = SNDManager.getLogger(configParameters, EventDataTable.class);

            deleteFromExpTables(oldRows, container, log);

            Set<Integer> cacheData = new HashSet<>();
            for (Map<String, Object> oldRow : oldRows)
            {
                cacheData.add((Integer) oldRow.get("EventId"));
            }

            List<Map<String, Object>> result = super.deleteRows(user, container, oldRows, configParameters, extraScriptContext);
            _sndManager.updateNarrativeCache(container, user, cacheData, log, false);

            return result;
        }

        @Override
        public int truncateRows(User user, Container container, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                throws BatchValidationException, QueryUpdateServiceException, SQLException
        {
            Logger log = SNDManager.getLogger(configParameters, EventDataTable.class);

            //get rows from snd.eventData
            deleteAllFromExpTables(log);

            OntologyManager.clearCaches();

            BatchValidationException errors = new BatchValidationException();
            SNDManager.get().clearNarrativeCache(container, user, errors);

            if (errors.hasErrors())
                throw errors;

            return super.truncateRows(user, container, configParameters, extraScriptContext);
        }

        private int deleteFromExpObjectProperty(Logger log)
        {
            int numDeletedRows;
            String defaultLsidAuthority = AppProps.getInstance().getDefaultLsidAuthority();

            try (DbScope.Transaction tx = _expSchema.getScope().ensureTransaction())
            {
                SqlExecutor executor = new SqlExecutor(_expSchema);
                SQLFragment truncObjProp = new SQLFragment("delete from " + _expSchema.getName() + ".ObjectProperty\n");
                truncObjProp.append("where objectId in\n");
                truncObjProp.append("(select objectId from exp.object where objectURI like ").appendValue("%urn:lsid:"+ defaultLsidAuthority +":SND.EventData.Folder%").append(")\n");
                truncObjProp.append("and propertyId in\n");
                truncObjProp.append("(select propertyId from exp.propertyDescriptor where PropertyURI ").append(SNDDomainKind.likeSndDomainURI(null,null)).append(")");
                numDeletedRows = executor.execute(truncObjProp);
                tx.commit();
            }
            catch (Exception e)
            {
                log.error(e.getMessage(), e);
                throw new IllegalStateException(e);
            }

            return numDeletedRows;
        }

        private int deleteFromExpObject(Logger log)
        {
            int numDeletedRows;

            try (DbScope.Transaction tx = _expSchema.getScope().ensureTransaction())
            {
                SqlExecutor executor = new SqlExecutor(_expSchema);
                SQLFragment truncObjProp = new SQLFragment("delete from " + _expSchema.getName() + ".Object\n");
                truncObjProp.append("where objectURI like '%urn:lsid:" + AppProps.getInstance().getDefaultLsidAuthority() + ":SND.EventData.Folder%'\n");
                numDeletedRows = executor.execute(truncObjProp);
                tx.commit();
            }
            catch (Exception e)
            {
                log.error(e.getMessage(), e);
                throw new IllegalStateException(e);
            }

            return numDeletedRows;
        }

        private void deleteFromExpTables(List<Map<String, Object>> oldRows, Container container, Logger log)
        {
            log.info("Begin deleting from exp.ObjectProperty and exp.Object.");
            int count = 0;

            //This will be a cascading delete across exp.ObjectProperty, exp.Object, and snd.EventData
            for (Map<String, Object> map : oldRows)
            {
                String objectURI = getObjectURI((Integer) map.get("EventDataId"), container);
                OntologyObject obj = OntologyManager.getOntologyObject(container, objectURI);

                //delete row from exp.ObjectProperty
                if(null != obj)
                    OntologyManager.deleteProperties(container, obj.getObjectId());

                //delete row from exp.Object
                OntologyManager.deleteOntologyObjects(container, objectURI);

                count++;
                //TODO: Count in exp.Object is not going to be the same as in snd.EventData - need to figure out how to get the count to log
                if (count % 1000 == 0)
                    log.info("Deleted " + count + " rows from exp.ObjectProperty and exp.Object.");
            }

            log.info("End deleting from exp.ObjectProperty and exp.Object. Deleted total of " + count + " rows.");
        }

        private int deleteAllFromExpTables(Logger log)
        {
            log.info("Deleting from exp.ObjectProperty table.");
            int objPropCount = deleteFromExpObjectProperty(log);
            log.info("Deleted " + objPropCount + " rows from exp.ObjectProperty.");

            log.info("Deleting from exp.Object table.");
            int objCount = deleteFromExpObject(log);
            log.info("Deleted " + objCount + " rows from exp.Object.");

            return objCount;
        }
    }
}