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
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.ContainerForeignKey;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.ForeignKey;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.exp.ObjectProperty;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.OntologyObject;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.settings.AppProps;
import org.labkey.api.snd.SNDDomainKind;
import org.labkey.api.snd.SNDService;
import org.labkey.api.util.UnexpectedException;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;
import org.labkey.snd.security.permissions.SNDViewerPermission;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Exposes all of the event attribute data, one row per attribute/value combination.
 * Essentially, a specialized and filtered wrapper over exp.ObjectProperty
 */
public class AttributeDataTable extends FilteredTable<SNDUserSchema>
{
    public AttributeDataTable(@NotNull SNDUserSchema userSchema, ContainerFilter cf)
    {
        super(OntologyManager.getTinfoObjectProperty(), userSchema, cf);

        setName(SNDUserSchema.TableType.AttributeData.name());
        setDescription("Event/package attribute data, one row per attribute/value combination.");

        wrapAllColumns(true);

        ExprColumn objectURI = new ExprColumn(this, "ObjectURI", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".ObjectURI"), JdbcType.VARCHAR);
        addColumn(objectURI);

        ExprColumn eventDataAndName = new ExprColumn(this, "EventDataAndName", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".EventDataAndName"), JdbcType.VARCHAR);
        addColumn(eventDataAndName);

        // Inject a lookup to the EventData table
        ExprColumn eventDataCol = new ExprColumn(this, "EventData", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".EventDataId"), JdbcType.VARCHAR);
        addColumn(eventDataCol);
        eventDataCol.setFk(QueryForeignKey.from(getUserSchema(), this.getContainerFilter())
                .table(SNDUserSchema.TableType.EventData.name())
                .key("EventDataId")
                .display("EventDataId")
                .raw(true));

        // Inject a Container column directly into the table, making it easier to follow container filtering rules
        ExprColumn containerCol = new ExprColumn(this, "Container", new SQLFragment(ExprColumn.STR_TABLE_ALIAS  + ".Container"), JdbcType.VARCHAR);
        addColumn(containerCol);
        containerCol.setFk(new ContainerForeignKey(getUserSchema()));

        getMutableColumn("ObjectId").setFk((ForeignKey)null);
        getMutableColumn("PropertyId").setLabel("Property");
    }

    @Override
    protected void applyContainerFilter(ContainerFilter filter)
    {
        // Handle this in the FROM SQL generation
    }

    @Override
    @NotNull
    public SQLFragment getFromSQL(String alias)
    {
        // Flatten data from primary base table (exp.ObjectProperty), exp.Object, and snd.EventData
        SQLFragment sql = new SQLFragment("(SELECT X.*, o.Container, o.ObjectURI, ed.EventDataId, CONCAT(ed.EventDataId,'-', pd.Name) as EventDataAndName FROM ");
        sql.append(super.getFromSQL("X"));
        sql.append(" INNER JOIN ");
        sql.append(OntologyManager.getTinfoObject(), "o");
        sql.append(" ON x.ObjectId = o.ObjectId AND ");
        // Apply the container filter
        sql.append(getContainerFilter().getSQLFragment(getSchema(), new SQLFragment("o.Container")));
        sql.append(" INNER JOIN ");
        sql.append(OntologyManager.getTinfoPropertyDescriptor(), "pd");
        // Filter to include only properties associated with packages
        sql.append(" ON x.PropertyId = pd.PropertyId AND pd.PropertyURI ").append(SNDDomainKind.likeSndDomainURI(null,null)).append(" INNER JOIN ");
        // Filter to include only values associated with EventDatas
        sql.append(SNDSchema.getInstance().getTableInfoEventData(), "ed");
        sql.append(" ON ed.ObjectURI = o.ObjectURI ");
        sql.append(") ");
        sql.append(alias);

        return sql;
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        return getContainer().hasPermission(user, SNDViewerPermission.class, getUserSchema().getContextualRoles());
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        UserSchema schema = SNDManager.getSndUserSchema(getContainer(), getUserSchema().getUser());
        SimpleUserSchema.SimpleTable simpleTable = new SimpleUserSchema.SimpleTable(schema, this, null);
        return new AttributeDataTable.UpdateService(simpleTable);
    }

    protected class UpdateService extends SNDQueryUpdateService
    {
        private final SNDManager _sndManager = SNDManager.get();
        private final SNDService _sndService = SNDService.get();
        private final DbSchema _expSchema = OntologyManager.getExpSchema();

        private Map<Integer, Object> packageMap = null;

        public UpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        private void loadPropertyDescriptorCache(User user)
        {
            //cache property descriptors
            packageMap = new HashMap<>();
            SQLFragment pkgs = new SQLFragment("select * from snd.Pkgs");
            List<Map<String, Object>> packages = (List<Map<String, Object>>) new SqlSelector(getSchema(), pkgs).getMapCollection();

            for (Map<String, Object> pkg : packages)
            {
                Integer pkgId = (Integer) pkg.get("PkgId");
                List<GWTPropertyDescriptor> packageAttributes = _sndManager.getPackageAttributes(getContainer(), user, pkgId);
                packageMap.put(pkgId, packageAttributes);
            }
        }

        private String getObjectURI(Integer eventDataId, Container c)
        {
            return _sndManager.generateLsid(c, String.valueOf(eventDataId));
        }

        private List<Map<String, Object>> getMutableData(DataIteratorBuilder rows, DataIteratorContext context)
        {
            List<Map<String, Object>> data;
            try
            {
                data = _sndService.getMutableData(rows, context);
            }
            catch (IOException e)
            {
                return null;
            }
            return data;
        }

        private List<GWTPropertyDescriptor> getPackageAttributes(User user, Integer pkgId)
        {
            if (packageMap == null)
            {
                loadPropertyDescriptorCache(user);
            }

            if(packageMap.containsKey(pkgId))
                return (List<GWTPropertyDescriptor>) packageMap.get(pkgId);

            return null;
        }

        private int insertObject(Container c, User u, String uri, List<ObjectProperty> props, Integer pkgId, int inserted, Logger logger)
        {
            try
            {
                ObjectProperty[] properties = new ObjectProperty[props.size()];
                properties = props.toArray(properties);
                OntologyManager.insertProperties(c, u, uri, true, properties);
                inserted += props.size();
                if (inserted % 10000 < props.size())
                    logger.info("Inserted/updated " + inserted + " rows.");
            }
            catch (ValidationException e)
            {
                logger.error(e.getMessage() + " PkgId " + pkgId, e);
                throw UnexpectedException.wrap(e, e.getMessage() + "For PkgId: " + pkgId + ".\n");
            }

            return inserted;
        }

        private List<Map<String, Object>> updateObjectProperty(User user, Container container, List<Map<String, Object>> data,
                                         boolean isInsertOnly, boolean isUpdate, Logger logger)
        {
            logger.info("Begin updating exp.ObjectProperty.");

            int inserted = 0;

            String prevUri = null;
            List<ObjectProperty> prevObjProps = new ArrayList<>();
            Integer pkgId = null;
            boolean found = false;

            Set<Integer> cacheEventIds = new HashSet<>();

            for(Map<String, Object> row : data)
            {
                //Note: DateTimeValue is not in the source view but adding it here since it is a field in exp.ObjectProperty,
                //and it may be part of the source view in the future. May need to modify the Date type here if it doesn't work as is.
                Date dateTimeValue = (Date) row.get("DateTimeValue");

                Double floatValue = (Double) row.get("FloatValue");
                String stringValue = (String) row.get("StringValue");
                char typeTag = ((String) row.get("TypeTag")).toCharArray()[0];
                String key = (String) row.get("_Key");

                //add to list of cached narrative rows to delete
                cacheEventIds.add((Integer) row.get("EventId"));

                String objectURI = getObjectURI((Integer) row.get("EventDataId"), container);
                if (prevUri == null)
                    prevUri = objectURI;

                pkgId = (Integer) row.get("PkgId");

                List<GWTPropertyDescriptor> packageAttributes = getPackageAttributes(user, pkgId);

                if (packageAttributes != null)
                {
                    for (GWTPropertyDescriptor pd : packageAttributes)
                    {
                        found = false;
                        if (null != pd && pd.getName().equals(key))
                        {
                            found = true;
                            Object value = null;
                            if (floatValue != null)
                                value = floatValue;
                            else if (dateTimeValue != null)
                                value = dateTimeValue;
                            else if (stringValue != null)
                            {
                                if (pd.getLookupSchema() != null && pd.getLookupQuery() != null)
                                {
                                    value = _sndService.normalizeLookupValue(user, container, pd.getLookupSchema(), pd.getLookupQuery(), stringValue);
                                }
                                else
                                {
                                    value = stringValue;
                                }
                            }

                            if (value == null)
                            {
                                if (pd.getLookupSchema() != null && pd.getLookupQuery() != null)
                                {
                                    logger.info("Value null for property " + pd.getName() + ". Value skipped. Verify lookup " + pd.getLookupSchema() + "." + pd.getLookupQuery() + " contains " + stringValue);
                                }
                                else
                                {
                                    logger.info("Value null for property " + pd.getName() + ". Value skipped.");
                                }
                            }

                            else
                            {
                                ObjectProperty oprop = new ObjectProperty(objectURI, container, pd.getPropertyURI(), value);
                                oprop.setTypeTag(typeTag);
                                oprop.setPropertyId(pd.getPropertyId());

                                OntologyObject ontologyObject = OntologyManager.getOntologyObject(container, objectURI);
                                if (null != ontologyObject)
                                {
                                    if (isUpdate)
                                    {
                                        OntologyManager.deleteProperty(ontologyObject, OntologyManager.getPropertyDescriptor(pd.getPropertyURI(), container), false);
                                    }
                                }

                                if (isUpdate || isInsertOnly)
                                {
                                    if (!prevUri.equals(objectURI))
                                    {
                                        inserted = insertObject(container, user, prevUri, prevObjProps, pkgId, inserted, logger);
                                        prevUri = objectURI;
                                        prevObjProps = new ArrayList<>();
                                    }
                                    prevObjProps.add(oprop);
                                }
                            }

                            break;
                        }
                    }
                    if (!found)
                    {
                        throw new RuntimeException("Attribute metadata not found for key: '" + key + "' in package: " + pkgId);
                    }
                }
                else
                {
                    throw new RuntimeException("Package metadata not found for package id: " + pkgId);
                }
            }

            if (!prevObjProps.isEmpty() && pkgId != null)
            {
                inserted = insertObject(container, user, prevUri, prevObjProps, pkgId, inserted, logger);
            }

            OntologyManager.clearPropertyCache();
            logger.info("End updating exp.ObjectProperty. Inserted/Updated " + inserted + " rows.");

            _sndManager.updateNarrativeCache(container, user, cacheEventIds, logger);

            return data;
        }

        @Override
        public int mergeRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                             @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
        {
            Logger log = SNDManager.getLogger(configParameters, AttributeDataTable.class);

            List<Map<String, Object>> data = getMutableData(rows, getDataIteratorContext(errors, InsertOption.MERGE, configParameters));

            // Large merge triggers importRows path
            Set<Object> distinctEventIds = new HashSet<>();
            for (Map<String, Object> map : data) {
                distinctEventIds.add(map.get("eventId"));
            }

            int max_merge_rows = SNDManager.MAX_MERGE_ROWS * 10; //ensure this code path is only triggered by the initial data load

            if (distinctEventIds.size() >= max_merge_rows)
            {
                data.clear();
                log.info("More than " + max_merge_rows + " rows. using importRows method.");
                return importRows(user, container, rows, errors, configParameters, extraScriptContext);
            }
            log.info("Merging rows.");
            return updateObjectProperty(user, container, data, false, true, log).size();
        }

        @Override
        public int importRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                              @Nullable Map<Enum,Object> configParameters, Map<String, Object> extraScriptContext)
        {
            Logger log = SNDManager.getLogger(configParameters, AttributeDataTable.class);
            List<Map<String, Object>> data = getMutableData(rows, getDataIteratorContext(errors, InsertOption.IMPORT, configParameters));
            return updateObjectProperty(user, container, data, true, false, log).size();
        }

        @Override
        public int truncateRows(User user, Container container, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
        {
            Logger log = SNDManager.getLogger(configParameters, AttributeDataTable.class);

            int numDeletedRows;
            String defaultLsidAuthority = AppProps.getInstance().getDefaultLsidAuthority();

            //exp.ObjectProperty has other data besides for snd - so deleting only snd relevant rows
            try (DbScope.Transaction tx = _expSchema.getScope().ensureTransaction())
            {
                SqlExecutor executor = new SqlExecutor(_expSchema);
                SQLFragment truncObjProp = new SQLFragment("delete from " + _expSchema.getName() + ".ObjectProperty\n");
                truncObjProp.append("where objectId in\n");
                truncObjProp.append("(select objectId from exp.object where objectURI like '%urn:lsid:"+ defaultLsidAuthority +":SND.EventData.Folder%')\n");
                truncObjProp.append("and propertyId in\n");
                truncObjProp.append("(select propertyId from exp.propertyDescriptor where PropertyURI ").append(SNDDomainKind.likeSndDomainURI(container.getRowId(), null).append(")"));
                numDeletedRows = executor.execute(truncObjProp);
                tx.commit();
            }
            catch (Exception e)
            {
                log.error(e.getMessage(), e);
                throw new IllegalStateException(e);
            }

            //Deleting event narrative cache
            log.info("Clearing event narrative cache.");
            _sndService.clearNarrativeCache(container, user);
            OntologyManager.clearCaches();

            return numDeletedRows;
        }

        @Override
        public List<Map<String, Object>> deleteRows(User user, Container container, List<Map<String, Object>> oldRows,
                                                    @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
        {
            Logger log = SNDManager.getLogger(configParameters, AttributeDataTable.class);

            Set<Integer> cacheData = new HashSet<>();
            try (DbScope.Transaction tx = _expSchema.getScope().ensureTransaction())
            {
                for (Map<String, Object> row : oldRows)
                {
                    Integer objectId = (Integer) row.get("ObjectId");
                    Integer propertyId = (Integer) row.get("PropertyId");

                    SqlExecutor executor = new SqlExecutor(_expSchema);
                    SQLFragment deleteObjProp = new SQLFragment("delete from " + _expSchema.getName() + ".ObjectProperty\n");
                    deleteObjProp.append("where objectId = ?\n");
                    deleteObjProp.add(objectId);
                    deleteObjProp.append("and propertyId = ?");
                    deleteObjProp.add(propertyId);
                    executor.execute(deleteObjProp);
                    log.info("Deleting a row in exp.ObjectProperty with objectId = " + objectId + ", and propertyId = " + propertyId);

                    //narrative cache to update
                    cacheData.add((Integer) row.get("EventId"));
                }
                tx.commit();
            }
            catch (Exception e)
            {
                log.error(e.getMessage(), e);
                throw new IllegalStateException(e);
            }

            _sndManager.updateNarrativeCache(container, user, cacheData, log, false);

            return oldRows;
        }
    }
}