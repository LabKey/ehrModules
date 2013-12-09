/*
 * Copyright (c) 2009-2013 LabKey Corporation
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

package org.labkey.ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.security.EHRCompletedInsertPermission;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.query.ExpSchema;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.Pair;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.security.EHRSecurityManager;
import org.labkey.ehr.utils.EHRQCStateImpl;

import java.beans.Introspector;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EHRManager
{
    private static final EHRManager _instance = new EHRManager();
    public static final String EHRStudyContainerPropName = "EHRStudyContainer";
    public static final String EHRAdminUserPropName = "EHRAdminUser";
    public static final String EHRCacheDemographicsPropName = "CacheDemographicsOnStartup";
    public static final String EHRStudyLabel = "Primate Electronic Health Record";
    public static final String SECURITY_PACKAGE = EHRCompletedInsertPermission.class.getPackage().getName();

    public static final String CAGE_HEIGHT_EXEMPTION_FLAG = "Height requirement, Cage Exception";
    public static final String CAGE_WEIGHT_EXEMPTION_FLAG = "Weight management, Cage Exception";

    private static final Logger _log = Logger.getLogger(EHRManager.class);

    private EHRManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EHRManager get()
    {
        return _instance;
    }

    /**
     * @return The value of the EHRSAdminUser
     */
    public User getEHRUser(Container c)
    {
        return getEHRUser(c, true);
    }

    public User getEHRUser(Container c, boolean logOnError)
    {
        try
        {
            Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
            ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRAdminUserPropName);
            String emailAddress = PropertyManager.getCoalecedProperty(PropertyManager.SHARED_USER, c, mp.getCategory(), EHRManager.EHRAdminUserPropName);
            if (emailAddress == null)
            {
                if (logOnError)
                    _log.error("Attempted to access EHR email module property from container: " + c.getPath() + ", but it was null.  Some code may not work as expected.", new Exception());
                return null;
            }

            ValidEmail email = new ValidEmail(emailAddress);
            return UserManager.getUser(email);
        }
        catch (ValidEmail.InvalidEmailException e)
        {
            throw new RuntimeException(e);
        }
    }

    /**
     * @return The value of the EHRStudyContainer, as set in the root container
     */
    public Container getPrimaryEHRContainer()
    {
        return getPrimaryEHRContainer(true);
    }

    public Container getPrimaryEHRContainer(boolean logOnError)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String path = PropertyManager.getCoalecedProperty(PropertyManager.SHARED_USER, ContainerManager.getRoot(), mp.getCategory(), EHRManager.EHRAdminUserPropName);
        if (path == null)
        {
            if (logOnError)
                _log.error("Attempted to access EHR containerPath Module Property, which has not been set for the root container", new Exception());
            return null;
        }

        return ContainerManager.getForPath(path);
    }

    /**
     * This is a somewhat crude method to identify any containers with an EHR study.  A study is identified as an EHR study if the
     * label is "Primate Electronic Health Record" and the EHR module is turned on in that folder.  This was originally written for
     * java upgrade scripts.
     * @return Set of EHR studies
     */
    public Set<Study> getEhrStudies(User u)
    {
        Module ehrModule = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        if (u == null)
            u = getEHRUser(ContainerManager.getRoot(), false);

        if (u == null)
        {
            _log.info("EHR User Module Property has not been set for root, cannot find EHR studies");
            return null;
        }

        Set<Study> ehrStudies = new HashSet<>();
        Study[] studies = StudyService.get().getAllStudies(ContainerManager.getRoot(), u);
        for (Study s : studies)
        {
            if (EHRStudyLabel.equals(s.getLabel()) && s.getContainer().getActiveModules().contains(ehrModule))
            {
                ehrStudies.add(s);
            }
        }
        return ehrStudies;
    }

    public List<String> verifyDatasetResources(Container c, User u)
    {
        List<String> messages = new ArrayList<>();
        Study s = StudyService.get().getStudy(c);
        if (s == null){
            messages.add("There is no study in container: " + c.getPath());
            return messages;
        }

        for (DataSet ds : s.getDataSets())
        {
            UserSchema us = QueryService.get().getUserSchema(u, c, "study");
            TableInfo ti = us.getTable(ds.getName(), true);

            if (!ti.hasTriggers(c))
            {
                messages.add("Missing trigger script for: " + ds.getLabel());
            }

            //TODO: query.xml file
        }

        return messages;
    }
    
    /**
     * The EHR expects certain properties to be present on all dataset.  This will iterate each dataset, add any
     * missing columns and make sure the columns point to the correct propertyURI
     * @param c
     * @param u
     * @param commitChanges
     * @return
     */
    public List<String> ensureStudyQCStates(Container c, final User u, final boolean commitChanges)
    {
        final List<String> messages = new ArrayList<>();
        final Study s = StudyService.get().getStudy(c);
        if (s == null){
            messages.add("There is no study in container: " + c.getPath());
            return messages;
        }

        boolean shouldClearCache = false;

        //NOTE: there is no public API to set a study, so hit the DB directly.
        final TableInfo studyTable = DbSchema.get("study").getTable("study");
        TableInfo ti = DbSchema.get("study").getTable("qcstate");

        Object[][] states = new Object[][]{
            {"Abnormal", "Value is abnormal", true},
            {"Completed", "Record has been completed and is public", true},
            {"Delete Requested", "Records are requested to be deleted", false},
            {"In Progress", "Draft Record, not public", false},
            {"Request: Approved", "Request has been approved", false},
            {"Request: Sample Delivered", "The sample associated with this request has been delivered", false},
            {"Request: Denied", "Request has been denied", false},
            {"Request: Cancelled", "Request has been cancelled", false},
            {"Request: Pending", "Part of a request that has not been approved", false},
            {"Review Required", "Review is required prior to public release", false},
            {"Scheduled", "Record is scheduled, but not performed", false}
        };

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            final Map<String, Integer> qcMap = new HashMap<>();

            //first QCStates
            for (Object[] qc : states)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Container"), c);
                filter.addCondition(FieldKey.fromString("label"), qc[0]);
                TableSelector ts = new TableSelector(ti, Collections.singleton("RowId"), filter, null);
                Integer[] rowIds = ts.getArray(Integer.class);
                if (rowIds.length > 0)
                {
                    qcMap.put((String)qc[0], rowIds[0]);
                    continue;
                }

                messages.add("Missing QCState: " + qc[0]);
                if (commitChanges)
                {
                    Map<String, Object> row = new CaseInsensitiveHashMap<>();
                    row.put("container", c.getId());
                    row.put("label", qc[0]);
                    row.put("description", qc[1]);
                    row.put("publicdata", qc[2]);
                    row = Table.insert(u, ti, row);

                    qcMap.put((String)row.get("label"), (Integer)row.get("rowid"));

                    shouldClearCache = true;
                }
            }

            //then check general properties
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("entityid"), s.getEntityId());
            TableSelector studySelector = new TableSelector(studyTable, filter, null);
            Map<String, Object> toUpdate = new CaseInsensitiveHashMap<>();
            Integer completedQCState = qcMap.get("Completed");

            try (Results rs = studySelector.getResults())
            {
                rs.next();
                if (!qcMap.containsKey("Completed"))
                {
                    messages.add("There was an error locating QCState Completed");
                }
                else
                {
                    if (rs.getInt("DefaultAssayQCState") != completedQCState)
                    {
                        messages.add("Set DefaultAssayQCState to Completed");
                        toUpdate.put("DefaultAssayQCState", completedQCState);
                    }

                    if (rs.getInt("DefaultDirectEntryQCState") != completedQCState)
                    {
                        messages.add("Set DefaultDirectEntryQCState to Completed");
                        toUpdate.put("DefaultDirectEntryQCState", completedQCState);
                    }

                    if (rs.getInt("DefaultPipelineQCState") != completedQCState)
                    {
                        messages.add("Set DefaultPipelineQCState to Completed");
                        toUpdate.put("DefaultPipelineQCState", completedQCState);
                    }

                    if (!rs.getBoolean("ShowPrivateDataByDefault"))
                    {
                        messages.add("Set ShowPrivateDataByDefault to true");
                        toUpdate.put("ShowPrivateDataByDefault", true);
                    }
                }
            }

            if (commitChanges && toUpdate.size() > 0)
            {
                Table.update(u, studyTable, toUpdate, s.getContainer().getId());
                shouldClearCache = true;
            }

            transaction.commit();
        }
        catch (SQLException e)
        {
            ExceptionUtil.logExceptionToMothership(null, e);
            messages.add(e.getMessage());
            return messages;
        }

        if (shouldClearCache)
        {
            Introspector.flushCaches();
            CacheManager.clearAllKnownCaches();
        }

        return messages;
    }
    
    /**
     * The EHR expects certain properties to be present on all dataset.  This will iterate each dataset, add any
     * missing columns and make sure the columns point to the correct propertyURI
     * @param c
     * @param u
     * @param commitChanges
     * @return
     */
    public List<String> ensureDatasetPropertyDescriptors(Container c, User u, boolean commitChanges, boolean rebuildIndexes)
    {
        List<String> messages = new ArrayList<>();

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            Study study = StudyService.get().getStudy(c);
            if (study == null) {
                messages.add("No study in this folder");
                return messages;
            }

            List<PropertyDescriptor> properties = new ArrayList<>();

            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.PROJECT.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.REMARK.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.OBJECTID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.PARENTID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.TASKID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.REQUESTID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.DESCRIPTION.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.PERFORMEDBY.getPropertyDescriptor().getPropertyURI(), c));

            List<PropertyDescriptor> optionalProperties = new ArrayList<>();
            optionalProperties.add(OntologyManager.getPropertyDescriptor(EHRProperties.ENDDATE.getPropertyDescriptor().getPropertyURI(), c));
            optionalProperties.add(OntologyManager.getPropertyDescriptor(EHRProperties.DATEREQUESTED.getPropertyDescriptor().getPropertyURI(), c));
            optionalProperties.add(OntologyManager.getPropertyDescriptor(EHRProperties.ACCOUNT.getPropertyDescriptor().getPropertyURI(), c));
            optionalProperties.add(OntologyManager.getPropertyDescriptor(EHRProperties.CASEID.getPropertyDescriptor().getPropertyURI(), c));

            List<? extends DataSet> datasets = study.getDataSets();
            boolean shouldClearCaches = false;

            for (DataSet dataset : datasets)
            {
                Domain domain = dataset.getDomain();
                DomainProperty[] dprops = domain.getProperties();
                boolean changed = false;
                List<PropertyDescriptor> toUpdate = new ArrayList<>();

                Set<PropertyDescriptor> props = new HashSet<>();
                props.addAll(properties);
                if (dataset.getCategory() != null && dataset.getCategory().equals("ClinPath") && !dataset.getName().equalsIgnoreCase("Clinpath Runs"))
                {
                    props.add(OntologyManager.getPropertyDescriptor(EHRProperties.RUNID.getPropertyDescriptor().getPropertyURI(), c));
                }

                for (PropertyDescriptor pd : props)
                {
                    boolean found = false;
                    for (DomainProperty dp : dprops)
                    {
                        //if the expected property is present, verify datatype and propertyURI
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            found = true;

                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Need to replace propertyURI on property \"" + pd.getName() + "\" for dataset " + dataset.getName());
                                if (commitChanges)
                                {
                                    toUpdate.add(pd);
                                }
                            }

                            if (!dp.getName().equals(pd.getName()))
                            {
                                messages.add("Case mismatch for property in dataset: " + dataset.getName() + ".  Expected: " + pd.getName() + ", but was: " + dp.getName() + ". This has not been automatically changed");
                            }
                        }
                    }

                    if (!found)
                    {
                        messages.add("Missing property \"" + pd.getName() + "\" on dataset: " + dataset.getName() + ".  Needs to be created.");
                        if (commitChanges)
                        {
                            DomainProperty d = domain.addProperty();
                            d.setPropertyURI(pd.getPropertyURI());
                            d.setName(pd.getName());
                            changed = true;
                        }
                    }
                }

                //dont add these, but if they already exist make sure we use the right propertyURI
                for (PropertyDescriptor pd : optionalProperties)
                {
                    for (DomainProperty dp : dprops)
                    {
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Incorrect propertyURI on optional property \"" + pd.getName() + "\" for dataset: " + dataset.getName() +".  Needs to be updated.");

                                if (commitChanges)
                                {
                                    toUpdate.add(pd);
                                }
                            }
                        }
                    }
                }

                if (changed)
                {
                    domain.save(u);
                    shouldClearCaches = true;
                }

                if (toUpdate.size() > 0)
                    shouldClearCaches = true;

                for (PropertyDescriptor pd : toUpdate)
                {
                    updatePropertyURI(domain, pd);
                }
            }

            //ensure keymanagement type
            if (commitChanges)
            {
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("UPDATE study.dataset SET keymanagementtype=?, keypropertyname=? WHERE demographicdata=? AND container=?", "GUID", "objectid", false, c.getEntityId());
                long total = new SqlExecutor(studySchema).execute(sql);
                messages.add("Non-demographics datasets updated to use objectId as a managed key: "+ total);
            }
            else
            {
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("SELECT * FROM study.dataset WHERE keymanagementtype!=? AND demographicdata=? AND container=?", "GUID", false, c.getEntityId());
                long total = new SqlExecutor(studySchema).execute(sql);
                if (total > 0)
                    messages.add("Non-demographics datasets that are not using objectId as a managed key: " + total);
            }

            //add indexes
            String[][] toIndex = new String[][]{{"objectid"}, {"taskid"}, {"parentid"}, {"runId"}, {"requestid"}, {"participantid", "date"}};
            String[][] toRemove = new String[][]{{"date"}};

            DbSchema schema = DbSchema.get("studydataset");
            Set<String> distinctIndexes = new HashSet<>();
            for (DataSet d : study.getDataSets())
            {
                String tableName = d.getDomain().getStorageTableName();
                TableInfo realTable = schema.getTable(tableName);
                if (realTable == null)
                {
                    _log.error("Table not found for dataset: " + d.getLabel() + " / " + d.getTypeURI());
                    continue;
                }


                for (String[] cols : toRemove)
                {
                    String indexName = tableName + "_" + StringUtils.join(cols, "_");

                    boolean exists = doesIndexExist(schema, tableName, indexName);
                    if (exists)
                    {
                        if (commitChanges)
                        {
                            messages.add("Dropping index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                            String sqlString = "DROP INDEX " + indexName + " ON " + realTable.getSelectName();
                            SQLFragment sql = new SQLFragment(sqlString);
                            SqlExecutor se = new SqlExecutor(schema);
                            se.execute(sql);
                        }
                        else
                        {
                            messages.add("Will drop index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                        }
                    }
                }

                List<String[]> toAdd = new ArrayList<>();
                for (String[] cols : toIndex)
                {
                    toAdd.add(cols);
                }

                if (d.getLabel().equalsIgnoreCase("Housing"))
                {
                    toAdd.add(new String[]{"participantid", "enddate"});
                    toAdd.add(new String[]{"participantid", "include:date,cage,room"});
                    toAdd.add(new String[]{"lsid", "participantid"});
                    toAdd.add(new String[]{"date", "lsid", "participantid"});
                    toAdd.add(new String[]{"date", "include:lsid,participantid,cage,room"});
                }
                else if (d.getLabel().equalsIgnoreCase("Assignment"))
                {
                    toAdd.add(new String[]{"project", "participantid", "enddate"});
                }
                else if (d.getLabel().equalsIgnoreCase("Demographics"))
                {
                    toAdd.add(new String[]{"participantid", "calculated_status"});
                }
                else if (d.getLabel().equalsIgnoreCase("Clinical Remarks"))
                {
                    toAdd.add(new String[]{"participantid", "lsid"});
                    toAdd.add(new String[]{"participantid:ASC", "date:ASC", "lsid:ASC"});
                    toAdd.add(new String[]{"date", "include:hx,caseid"});
                }
                else if (d.getLabel().equalsIgnoreCase("Cases"))
                {
                    toAdd.add(new String[]{"enddate", "qcstate", "lsid"});
                }
                else if (d.getName().equalsIgnoreCase("drug"))
                {
                    toAdd.add(new String[]{"treatmentid"});
                    toAdd.add(new String[]{"qcstate", "include:treatmentid"});
                }

                for (String[] indexCols : toAdd)
                {
                    boolean missingCols = false;

                    List<String> cols = new ArrayList<>();
                    String[] includedCols = null;
                    Map<String, String> directionMap = new HashMap<>();

                    for (String name : indexCols)
                    {
                        String[] tokens = name.split(":");
                        if (tokens[0].equalsIgnoreCase("include"))
                        {
                            if (tokens.length > 1)
                            {
                                includedCols = tokens[1].split(",");
                            }
                        }
                        else
                        {
                            cols.add(tokens[0]);
                            if (tokens.length > 1)
                                directionMap.put(tokens[0], tokens[1]);
                        }
                    }

                    for (String col : cols)
                    {
                        if (realTable.getColumn(col) == null)
                        {
                            //messages.add("Dataset: " + d.getName() + " does not have column " + col + ", so indexing will be skipped");
                            missingCols = true;
                        }
                    }

                    if (missingCols)
                        continue;

                    String indexName = tableName + "_" + StringUtils.join(cols, "_");
                    if (includedCols != null)
                    {
                        indexName += "_include_" + StringUtils.join(includedCols, "_");
                    }

                    if (distinctIndexes.contains(indexName))
                        throw new RuntimeException("An index has already been created with the name: " + indexName);
                    distinctIndexes.add(indexName);

                    Set<String> indexNames = new CaseInsensitiveHashSet();
                    DatabaseMetaData meta = schema.getScope().getConnection().getMetaData();
                    ResultSet rs = null;
                    try
                    {
                        rs = meta.getIndexInfo(schema.getScope().getDatabaseName(), schema.getName(), tableName, false, false);
                        while (rs.next())
                        {
                            indexNames.add(rs.getString("INDEX_NAME"));
                        }
                    }
                    finally
                    {
                        ResultSetUtil.close(rs);
                    }

                    boolean exists = indexNames.contains(indexName);
                    if (exists && rebuildIndexes)
                    {
                        if (commitChanges)
                        {
                            dropIndex(schema, realTable, indexName, cols, d.getLabel(), messages);
                        }
                        else
                        {
                            messages.add("Will drop/recreate index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                        }
                        exists = false;
                    }

                    if (!exists)
                    {
                        if (commitChanges)
                        {
                            List<String> columns = new ArrayList<>();
                            for (String name : cols)
                            {
                                if (schema.getSqlDialect().isSqlServer() && directionMap.containsKey(name))
                                    name += " " + directionMap.get(name);

                                columns.add(name);
                            }

                            createIndex(schema, realTable, d.getLabel(), indexName, columns, includedCols, messages);
                        }
                        else
                        {
                            messages.add("Missing index on column(s): " + StringUtils.join(indexCols, ", ") + (includedCols != null ? " include: " + StringUtils.join(includedCols, ",") : "") + " for dataset: " + d.getLabel());
                        }
                    }
                }
            }

            //add study.participant indexes
            createParticipantIndexes(messages, commitChanges, rebuildIndexes);

            transaction.commit();

            if (shouldClearCaches)
            {
                Introspector.flushCaches();
                CacheManager.clearAllKnownCaches();
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);

        }
        catch (ChangePropertyDescriptorException e)
        {
            throw new RuntimeException(e);
        }

        return messages;
    }

    private void createParticipantIndexes(List<String> messages, boolean commitChanges, boolean rebuildIndexes) throws SQLException
    {
        DbSchema schema = DbSchema.get("study");
        TableInfo realTable = schema.getTable("participant");
        String indexName = "EHR_INDEX_container_participantid";
        List<String> cols = Arrays.asList("container", "participantid");
        String label = "participant";

        boolean exists = doesIndexExist(schema, "participant", indexName);

        if (commitChanges && (!exists || rebuildIndexes))
        {
            if (exists)
                dropIndex(schema, realTable, indexName, cols, label, messages);

            createIndex(schema, realTable, label, indexName, cols, null, messages);
        }
        else if ((!exists || rebuildIndexes))
        {
            if (exists)
                messages.add("Will drop index on column(s): container, participantid" + " for table: study.participant");

            messages.add("Will create index on column(s): container, participantid" + " for table: study.participant");
        }
    }

    private void createIndex(DbSchema schema, TableInfo realTable, String tableName, String indexName, List<String> columns, String[] includedCols, List<String> messages)
    {
        messages.add("Creating index on column(s): " + StringUtils.join(columns, ", ") + " for table: " + tableName);
        String sqlString = "CREATE INDEX " + indexName + " ON " + realTable.getSelectName() + "(" + StringUtils.join(columns, ", ") + ")";
        if (schema.getSqlDialect().isSqlServer())
        {
            if (includedCols != null)
                sqlString += " INCLUDE (" + StringUtils.join(includedCols, ", ") + ") ";

            sqlString += " WITH (DATA_COMPRESSION = ROW)";
        }
        SQLFragment sql = new SQLFragment(sqlString);
        SqlExecutor se = new SqlExecutor(schema);
        se.execute(sql);
    }

    private boolean doesIndexExist(DbSchema schema, String tableName, String indexName) throws SQLException
    {
        Set<String> indexNames = new CaseInsensitiveHashSet();
        DatabaseMetaData meta = schema.getScope().getConnection().getMetaData();
        ResultSet rs = null;
        try
        {
            rs = meta.getIndexInfo(schema.getScope().getDatabaseName(), schema.getName(), tableName, false, false);
            while (rs.next())
            {
                indexNames.add(rs.getString("INDEX_NAME"));
            }
        }
        finally
        {
            ResultSetUtil.close(rs);
        }

        return indexNames.contains(indexName);
    }

    private void dropIndex(DbSchema schema, TableInfo realTable, String indexName, List<String> cols, String tableName, List<String> messages)
    {
        messages.add("Dropping index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + tableName);
        String sqlString = "DROP INDEX " + indexName + " ON " + realTable.getSelectName();
        SQLFragment sql = new SQLFragment(sqlString);
        SqlExecutor se = new SqlExecutor(schema);
        se.execute(sql);
    }

    //the module's SQL scripts create indexes, but apparently only SQL server enterprise supports compression,
    //so this code will let admins compress them after the fact
    public void compressEHRSchemaIndexes()
    {
        if (!DbScope.getLabkeyScope().getSqlDialect().isSqlServer())
        {
            _log.error("Index compression on EHR can only be performed on SQL server currently.");
            return;
        }

        _log.info("Compressing indexes on select EHR schema tables");

        List<Pair<String, String[]>> names = new ArrayList<>();
        names.add(Pair.of("encounter_flags", new String[]{"objectid"}));
        names.add(Pair.of("encounter_flags", new String[]{"parentid"}));
        names.add(Pair.of("encounter_flags", new String[]{"id"}));

        names.add(Pair.of("encounter_participants", new String[]{"objectid"}));
        names.add(Pair.of("encounter_participants", new String[]{"parentid"}));
        names.add(Pair.of("encounter_participants", new String[]{"id"}));
        names.add(Pair.of("encounter_participants", new String[]{"taskid"}));

        names.add(Pair.of("encounter_summaries", new String[]{"objectid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"parentid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"id"}));

        names.add(Pair.of("encounter_summaries", new String[]{"parentid", "objectid", "container", "id"}));
        names.add(Pair.of("encounter_summaries", new String[]{"container", "objectid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"container", "parentid"}));

        names.add(Pair.of("snomed_tags", new String[]{"caseid"}));
        names.add(Pair.of("snomed_tags", new String[]{"id"}));
        names.add(Pair.of("snomed_tags", new String[]{"id", "recordid", "code"}));

        names.add(Pair.of("snomed_tags", new String[]{"objectid"}));
        names.add(Pair.of("snomed_tags", new String[]{"parentid"}));
        names.add(Pair.of("snomed_tags", new String[]{"taskid"}));
        names.add(Pair.of("snomed_tags", new String[]{"recordid"}));

        names.add(Pair.of("snomed_tags", new String[]{"recordid", "rowid", "id"}));
        names.add(Pair.of("snomed_tags", new String[]{"code", "rowid", "id", "recordid"}));
        names.add(Pair.of("snomed_tags", new String[]{"recordid", "container", "code"}));
        names.add(Pair.of("snomed_tags", new String[]{"code", "container"}));

        names.add(Pair.of("treatment_times", new String[]{"container", "treatmentid"}));

        for (Pair<String, String[]> pair : names)
        {
            String table = pair.first;
            String indexName = table + "_" + StringUtils.join(pair.second, "_");
            rebuildIndex(table, indexName);
        }

        //clustered index does not follow other naming conventions
        rebuildIndex("snomed_tags", "CIDX_snomed_tags");
    }

    private void rebuildIndex(String table, String indexName)
    {
        DbSchema ehr = EHRSchema.getInstance().getSchema();
        SQLFragment sql = new SQLFragment("ALTER INDEX " + indexName + " ON ehr." + table + " REBUILD WITH (DATA_COMPRESSION = ROW);");
        SqlExecutor se = new SqlExecutor(ehr);
        se.execute(sql);
    }
    
    //NOTE: this assumes the property already exists
    private void updatePropertyURI(Domain d, PropertyDescriptor pd) throws SQLException
    {
        Table.TableResultSet results = null;

        try
        {
            DbSchema expSchema = DbSchema.get(ExpSchema.SCHEMA_NAME);
            TableInfo propertyDomain = expSchema.getTable("propertydomain");
            TableInfo propertyDescriptor = expSchema.getTable("propertydescriptor");

            //find propertyId
            TableSelector ts = new TableSelector(propertyDescriptor, Collections.singleton("propertyid"), new SimpleFilter(FieldKey.fromString("PropertyURI"), pd.getPropertyURI()), null);
            Integer[] ids = ts.getArray(Integer.class);
            if (ids.length == 0)
            {
                throw new SQLException("Unknown propertyURI: " + pd.getPropertyURI());
            }
            int propertyId = ids[0];

            //first ensure the propertyURI exists
            SQLFragment sql = new SQLFragment("select propertyid from exp.propertydomain p where domainId = ? AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name " + (expSchema.getSqlDialect().isPostgreSQL() ? "ilike" : "like") + " ?)", d.getTypeId(), pd.getName());
            SqlSelector selector = new SqlSelector(expSchema.getScope(), sql);
            results = selector.getResultSet();

            List<Integer> oldIds = new ArrayList<>();
            while (results.next())
            {
                Map<String, Object> row = results.getRowMap();
                oldIds.add((Integer)row.get("propertyid"));
            }

            if (oldIds.size() == 0)
            {
                //this should not happen
                throw new SQLException("Unexpected: propertyId " + pd.getPropertyURI() + " does not exists for domain: " + d.getTypeURI());
            }

            if (oldIds.size() == 1 && oldIds.contains(propertyId))
            {
                //property ID already correct
                return;
            }

            SqlExecutor executor = new SqlExecutor(expSchema);

            if (oldIds.size() == 1)
            {
                //only 1 ID, but not using correct propertyURI
                String updateSql = "UPDATE exp.propertydomain SET propertyid = ? where domainId = ? AND propertyid = ?";
                long updated = executor.execute(updateSql, propertyId, d.getTypeId(), oldIds.get(0));

                String deleteSql = "DELETE FROM exp.propertydescriptor WHERE propertyid = ?";
                long deleted = executor.execute(deleteSql, oldIds.get(0));
            }
            else
            {
                //if more than 1 row exists, this means we have duplicate property descriptors
                SQLFragment selectSql = new SQLFragment("select min(sortorder) from exp.propertydomain p where domainId = ? AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name = ?");
                SqlSelector ss = new SqlSelector(expSchema.getScope(), selectSql);
                ResultSet resultSet = ss.getResultSet();
                Integer minSort = resultSet.getInt(0);

                String updateSql = "UPDATE exp.propertydomain SET propertyid = ? where domainId = ? AND propertyid IN ? AND sortorder = ?";
                executor.execute(updateSql, propertyId, d.getTypeId(), oldIds, minSort);

                String deleteSql1 = "DELETE FROM exp.propertydescriptor WHERE propertyid != ? AND propertyid IN ?";
                executor.execute(deleteSql1, propertyId, oldIds);

                String deleteSql2 = "DELETE FROM exp.propertydomain WHERE propertyid != ? AND domainId = ? AND propertyid IN ? AND sortorder != ?";
                executor.execute(deleteSql2, propertyId, d.getTypeId(), oldIds, minSort);
            }
        }
        finally
        {
            ResultSetUtil.close(results);
        }
    }

    public Map<String, Map<String, Object>> getAnimalDetails(User u, Container c, String[] animalsIds, Set<String> extraSources)
    {
        Map<String, Map<String, Object>> ret = new HashMap<String, Map<String, Object>>();

        //first the basic information



        return ret;
    }

    public String getFormTypeForTask(Container c, User u, String taskId)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, EHRSchema.EHR_SCHEMANAME);
        if (us == null)
            return null;

        TableInfo ti = us.getTable(EHRSchema.TABLE_TASKS);
        if (ti == null)
            return null;

        TableSelector ts = new TableSelector(ti, Collections.singleton("formType"), new SimpleFilter(FieldKey.fromString("taskid"), taskId), null);
        String[] ret = ts.getArray(String.class);

        if (ret != null && ret.length == 1)
            return ret[0];

        return null;
    }

    public String getFormTypeForRequest(Container c, User u, String requestId)
    {
        UserSchema us = QueryService.get().getUserSchema(u, c, EHRSchema.EHR_SCHEMANAME);
        if (us == null)
            return null;

        TableInfo ti = us.getTable(EHRSchema.TABLE_REQUESTS);
        if (ti == null)
            return null;

        TableSelector ts = new TableSelector(ti, Collections.singleton("formType"), new SimpleFilter(FieldKey.fromString("taskid"), requestId), null);
        String[] ret = ts.getArray(String.class);

        if (ret != null && ret.length == 1)
            return ret[0];

        return null;
    }

    public int discardTask(Container c, User u, String taskId) throws SQLException
    {
        DataEntryForm def = getDataEntryFormForTask(c, u, taskId);

        int deleted = 0;
        for (final TableInfo ti : def.getTables(c, u))
        {
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("taskId"), taskId);
            final List<Map<String, Object>> keysToDelete = new ArrayList<>();
            final List<Map<String, Object>> requestsToQueue = new ArrayList<>();
            Set<String> colNames = new HashSet<>();
            colNames.addAll(ti.getPkColumnNames());
            if (ti.getColumn(FieldKey.fromString("requestid")) != null)
                colNames.add("requestid");

            // forEachMap is much more efficient than iterating ResultSet and calling ResultSetUtil.mapRow(rs)
            TableSelector ts = new TableSelector(ti, colNames, filter, null);
            ts.forEachMap(new Selector.ForEachBlock<Map<String, Object>>()
            {
                @Override
                public void exec(Map<String, Object> map) throws SQLException
                {
                    Map<String, Object> row = new CaseInsensitiveHashMap<>();
                    row.putAll(map);

                    if (row.containsKey("requestid") && row.get("requestid") != null)
                    {
                        row.put("requestid", null);
                        row.put("qcstate", null);
                        row.put("taskid", null);
                        row.put("qcstateLabel", "Request: Approved");

                        requestsToQueue.add(row);
                    }
                    else
                    {
                        keysToDelete.add(row);
                    }
                }
            });

            try
            {
                if (!keysToDelete.isEmpty())
                {
                    ti.getUpdateService().deleteRows(u, c, keysToDelete, new HashMap<String, Object>());
                }


                if (!requestsToQueue.isEmpty())
                {
                    ti.getUpdateService().updateRows(u, c, requestsToQueue, requestsToQueue, new HashMap<String, Object>());
                }
            }
            catch (InvalidKeyException e)
            {
                throw new RuntimeException(e);
            }
            catch (QueryUpdateServiceException e)
            {
                throw new RuntimeException(e);
            }
            catch (BatchValidationException e)
            {
                throw new RuntimeException(e);
            }
        }

        return deleted;
    }

    public DataEntryForm getDataEntryFormForTask(Container c, User u, String taskId)
    {
        String formType = EHRManager.get().getFormTypeForTask(c, u, taskId);
        if (formType == null)
        {
            throw new IllegalArgumentException("Unable to find formType for the task: " + taskId);
        }

        DataEntryForm def = DataEntryManager.get().getFormByName(formType, c, u);
        if (def == null)
        {
            throw new IllegalArgumentException("Unable to find form type for the name: " + formType);
        }

        return def;
    }

    public DataEntryForm getDataEntryFormForRequest(Container c, User u, String requestId)
    {
        String formType = EHRManager.get().getFormTypeForRequest(c, u, requestId);
        if (formType == null)
        {
            throw new IllegalArgumentException("Unable to find formType for the request: " + requestId);
        }

        DataEntryForm def = DataEntryManager.get().getFormByName(formType, c, u);
        if (def == null)
        {
            throw new IllegalArgumentException("Unable to find form type for the name: " + formType);
        }

        return def;
    }

    public boolean canDiscardTask(Container c, User u, String taskId, List<String> errorMsgs)
    {
        DataEntryForm def = getDataEntryFormForTask(c, u, taskId);

        Map<Integer, EHRQCState> qcStateMap = new HashMap<>();
        for (EHRQCState qc : EHRManager.get().getQCStates(c))
        {
            qcStateMap.put(qc.getRowId(), qc);
        }

        boolean hasPermission = true;
        Set<TableInfo> distinctTables = def.getTables(c, u);
        for (TableInfo ti : distinctTables)
        {
            if (ti.getColumn(FieldKey.fromString("qcstate")) != null && ti.getColumn(FieldKey.fromString("taskid")) != null)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("taskid"), taskId);
                TableSelector ts = new TableSelector(ti, Collections.singleton("qcstate"), filter, null);
                Set<Integer> distinctQcStates = new HashSet<>();
                distinctQcStates.addAll(Arrays.asList(ts.getArray(Integer.class)));
                for (Integer qc : distinctQcStates)
                {
                    EHRQCState q = qcStateMap.get(qc);
                    if (q != null)
                    {
                        if (!EHRSecurityManager.get().testPermission(u, ti, DeletePermission.class, q))
                        {
                            hasPermission = false;
                            errorMsgs.add("Insufficient permissions to delete record with QCState of: " + q.getLabel());
                            break;
                        }
                    }
                }
            }
        }

        return hasPermission;
    }

    public EHRQCState[] getQCStates(Container c)
    {
        SQLFragment sql = new SQLFragment("SELECT * FROM study.qcstate qc LEFT JOIN ehr.qcstatemetadata md ON (qc.label = md.QCStateLabel) WHERE qc.container = ?", c.getEntityId());
        DbSchema db = DbSchema.get("study");
        return new SqlSelector(db, sql).getArray(EHRQCStateImpl.class);
    }
}