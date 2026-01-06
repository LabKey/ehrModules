/*
 * Copyright (c) 2009-2019 LabKey Corporation
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

import com.google.common.collect.Sets;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.apache.xmlbeans.XmlException;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.PropertyManager.WritablePropertyMap;
import org.labkey.api.data.PropertyStorageSpec;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableResultSet;
import org.labkey.api.data.TableSelector;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.ehr.EHRQCState;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.DataEntryForm;
import org.labkey.api.ehr.security.EHRCompletedInsertPermission;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.api.StorageProvisioner;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.AliasManager;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.Queryable;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.settings.LookAndFeelProperties;
import org.labkey.api.study.Dataset;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ExceptionUtil;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.util.Pair;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.data.xml.ColumnType;
import org.labkey.data.xml.TableType;
import org.labkey.data.xml.TablesDocument;
import org.labkey.data.xml.TablesType;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.security.EHRSecurityManager;
import org.labkey.ehr.utils.EHRQCStateImpl;

import java.beans.Introspector;
import java.io.File;
import java.io.IOException;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class EHRManager
{
    private static final EHRManager _instance = new EHRManager();
    public static final String EHRStudyContainerPropName = "EHRStudyContainer";
    public static final String EHRCustomModulePropName = "EHRCustomModule";
    public static final String EHRAdminUserPropName = "EHRAdminUser";
    public static final String EHRDefaultClinicalProjectName = "EHRDefaultClinicalProjectName";
    public static final String EHRCacheDemographicsPropName = "CacheDemographicsOnStartup";
    public static final String EHRStudyLabel = "Primate Electronic Health Record";
    @Queryable
    public static final String OBS_REVIEWED = "Reviewed";
    @Queryable
    public static final String OBS_CATEGORY_OBSERVATIONS = "Observations";
    @Queryable
    public static final String VET_REVIEW = "Vet Review";
    @Queryable
    public static final String VET_ATTENTION = "Vet Attention";
    @Queryable
    public static final String TECH_REVIEW = "Reviewed";

    public static final String SECURITY_PACKAGE = EHRCompletedInsertPermission.class.getPackage().getName();

    // Column name constants to reduce hardcoding
    private static final class ColumnNames
    {
        // Common columns
        static final String PARTICIPANT_ID = "participantid";
        static final String DATE = "date";
        static final String END_DATE = "enddate";
        static final String LSID = "lsid";
        static final String OBJECT_ID = "objectid";
        static final String PARENT_ID = "parentid";
        static final String TASK_ID = "taskid";
        static final String REQUEST_ID = "requestid";
        static final String QC_STATE = "qcstate";
        static final String RUN_ID = "runId";
        static final String VET_REVIEW = "vetreview";

        // Dataset-specific columns
        static final String CAGE = "cage";
        static final String ROOM = "room";
        static final String PROJECT = "project";
        static final String CASE_NO = "caseno";
        static final String CALCULATED_STATUS = "calculated_status";
        static final String DEATH = "death";
        static final String CATEGORY = "category";
        static final String VALUE = "value";
        static final String HX = "hx";
        static final String CASE_ID = "caseid";
        static final String DATE_FINALIZED = "datefinalized";
        static final String ASSIGNED_VET = "assignedvet";
        static final String OBSERVATION = "observation";
        static final String AREA = "area";
        static final String REMARK = "remark";
        static final String TREATMENT_ID = "treatmentid";

        // Database/schema columns
        static final String KEY_MANAGEMENT_TYPE = "keymanagementtype";
        static final String KEY_PROPERTY_NAME = "keypropertyname";
        static final String DEMOGRAPHIC_DATA = "demographicdata";

        // Index include prefix
        static final String INCLUDE_PREFIX = "include:";
    }

    // Dataset name constants
    private static final class DatasetNames
    {
        static final String CLINICAL_OBSERVATIONS = "clinical_observations";
        static final String HOUSING = "Housing";
        static final String ASSIGNMENT = "Assignment";
        static final String CLINPATH_RUNS = "Clinpath Runs";
        static final String CLINICAL_ENCOUNTERS = "Clinical Encounters";
        static final String DEMOGRAPHICS = "Demographics";
        static final String ANIMAL_RECORD_FLAGS = "Animal Record Flags";
        static final String CLINICAL_REMARKS = "Clinical Remarks";
        static final String TREATMENT_ORDERS = "Treatment Orders";
        static final String CASES = "Cases";
        static final String DRUG = "drug";
        static final String BLOOD = "blood";
        static final String GROSS_FINDINGS = "Gross Findings";
    }

    // Clinical observations index configuration - shared between ensureDatasetPropertyDescriptors and prepareEHRIndexContext
    private static final String[] CLINICAL_OBSERVATIONS_REGULAR_COLS = new String[]{
        ColumnNames.PARTICIPANT_ID,
        ColumnNames.DATE
    };

    private static final String[] CLINICAL_OBSERVATIONS_INCLUDED_COLS = new String[]{
        ColumnNames.TASK_ID,
        ColumnNames.LSID,
        ColumnNames.CATEGORY,
        ColumnNames.OBSERVATION,
        ColumnNames.AREA,
        ColumnNames.REMARK
    };

    // Constructed from the regular and included columns above
    private static final String[] CLINICAL_OBSERVATIONS_INDEX_COLS = new String[]{
        ColumnNames.PARTICIPANT_ID,
        ColumnNames.DATE,
        ColumnNames.INCLUDE_PREFIX + String.join(",", CLINICAL_OBSERVATIONS_INCLUDED_COLS)
    };

    private static final Logger _log = LogHelper.getLogger(EHRManager.class, "Details of comparing data types with expectations, DB status");

    private EHRManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EHRManager get()
    {
        return _instance;
    }

    /**
     * @return The value of the EHRAdminUser
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
            String emailAddress = PropertyManager.getCoalescedProperty(PropertyManager.SHARED_USER, c, mp.getCategory(), EHRManager.EHRAdminUserPropName);
            if (emailAddress == null)
            {
                if (logOnError)
                    _log.warn("Attempted to access EHR email module property from container: " + (c == null ? null : c.getPath()) + ", but it was null.  Some code may not work as expected.", new Exception());
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
        String path = PropertyManager.getCoalescedProperty(PropertyManager.SHARED_USER, ContainerManager.getRoot(), mp.getCategory(), EHRManager.EHRAdminUserPropName);
        if (path == null)
        {
            if (logOnError)
                _log.error("Attempted to access EHR containerPath Module Property, which has not been set for the root container", new Exception());
            return null;
        }

        return ContainerManager.getForPath(path);
    }

    public String getEHRDefaultClinicalProjectName(Container c)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRDefaultClinicalProjectName);

        return PropertyManager.getCoalescedProperty(PropertyManager.SHARED_USER, c, mp.getCategory(), EHRManager.EHRDefaultClinicalProjectName);
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
        for (Study s : StudyService.get().getAllStudies(ContainerManager.getRoot(), u))
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

        for (Dataset ds : s.getDatasets())
        {
            UserSchema us = QueryService.get().getUserSchema(u, c, "study");
            TableInfo ti = us.getTable(ds.getName(), true);

            if (!ti.hasTriggers(c))
            {
                messages.add("Missing trigger script for: " + ds.getName());
            }

            //TODO: query.xml file
        }

        return messages;
    }
    
    /**
     * The EHR expects certain QC states to exist. This will inspect the current study and create any missing QC states.
     */
    public List<String> ensureStudyQCStates(Container c, final User u, final boolean commitChanges)
    {
        final List<String> messages = new ArrayList<>();

        boolean shouldClearCache = false;

        //NOTE: there is no public API to set a study, so hit the DB directly.
        final TableInfo studyTable = DbSchema.get("study").getTable("study");
        TableInfo ti = CoreSchema.getInstance().getTableInfoDataStates();

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
            {"Request: On Hold", "Request has been put on hold", false},
            {"Review Required", "Review is required prior to public release", false},
            {"Scheduled", "Record is scheduled, but not performed", false},
            {"Started", "Record has started, but not completed",true}
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
            final Study s = StudyService.get().getStudy(c);
            if (s != null)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("entityid"), s.getEntityId());
                TableSelector studySelector = new TableSelector(studyTable, filter, null);
                Map<String, Object> toUpdate = new CaseInsensitiveHashMap<>();
                Integer completedQCState = qcMap.get("Completed");

                try (ResultSet rs = studySelector.getResultSet())
                {
                    rs.next();
                    if (!qcMap.containsKey("Completed"))
                    {
                        messages.add("There was an error locating QCState Completed");
                    }
                    else
                    {
                        if (rs.getInt("DefaultPublishDataQCState") != completedQCState)
                        {
                            messages.add("Set DefaultPublishDataQCState to Completed");
                            toUpdate.put("DefaultPublishDataQCState", completedQCState);
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

                if (commitChanges && !toUpdate.isEmpty())
                {
                    Table.update(u, studyTable, toUpdate, s.getContainer().getId());
                    shouldClearCache = true;
                }
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
     */
    public List<String> ensureDatasetPropertyDescriptors(Container c, User u, boolean commitChanges, boolean rebuildIndexes)
    {
        List<String> messages = new ArrayList<>();

        Study study = StudyService.get().getStudy(c);
        if (study == null) {
            messages.add("No study in this folder");
            return messages;
        }

        List<String> propertyURIs = new ArrayList<>();
        propertyURIs.add(EHRProperties.PROJECT.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.REMARK.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.OBJECTID.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.PARENTID.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.TASKID.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.REQUESTID.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.DESCRIPTION.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.PERFORMEDBY.getPropertyDescriptor().getPropertyURI());
        propertyURIs.add(EHRProperties.FORMSORT.getPropertyDescriptor().getPropertyURI());

        Container sharedContainer = ContainerManager.getSharedContainer();
        List<PropertyDescriptor> properties = resolveProperties(c, sharedContainer, propertyURIs);

        List<String> optionalPropertyURIs = new ArrayList<>();
        optionalPropertyURIs.add(EHRProperties.ENDDATE.getPropertyDescriptor().getPropertyURI());
        optionalPropertyURIs.add(EHRProperties.DATEREQUESTED.getPropertyDescriptor().getPropertyURI());
        optionalPropertyURIs.add(EHRProperties.ACCOUNT.getPropertyDescriptor().getPropertyURI());
        optionalPropertyURIs.add(EHRProperties.CASEID.getPropertyDescriptor().getPropertyURI());
        optionalPropertyURIs.add(EHRProperties.VETREVIEW.getPropertyDescriptor().getPropertyURI());
        optionalPropertyURIs.add(EHRProperties.VETREVIEWDATE.getPropertyDescriptor().getPropertyURI());
        optionalPropertyURIs.add(EHRProperties.DATEFINALIZED.getPropertyDescriptor().getPropertyURI());

        List<PropertyDescriptor> optionalProperties = resolveProperties(c, sharedContainer, optionalPropertyURIs);

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            List<? extends Dataset> datasets = study.getDatasets();

            // Hack - adding a shared EHR property to a domain ends up reparenting it to the EHR folder. They
            // need to keep living in the /Shared project. Rather than introducing a brand new API for adding a shared
            // PD to an existing domain, we'll directly update the owning container afterwards
            Set<PropertyDescriptor> pdsToReparentInShared = new HashSet<>();

            for (Dataset dataset : datasets)
            {
                Domain domain = dataset.getDomain();
                List<? extends DomainProperty> dprops = domain.getProperties();

                boolean changed = false;
                List<PropertyDescriptor> toUpdate = new ArrayList<>();

                List<PropertyDescriptor> props = new ArrayList<>(properties);
                if (dataset.getViewCategory() != null && "ClinPath".equalsIgnoreCase(dataset.getViewCategory().getLabel()) && !dataset.getName().equalsIgnoreCase("Clinpath Runs"))
                {
                    String propertyURI = EHRProperties.RUNID.getPropertyDescriptor().getPropertyURI();
                    resolveProperty(c, sharedContainer, props, propertyURI);
                }

                for (PropertyDescriptor pd : props)
                {
                    boolean found = false;
                    for (DomainProperty dp : dprops)
                    {
                        if (dp == null)
                        {
                            _log.error("domain has a null domain property: " + domain.getName());
                            continue;
                        }

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
                            domain = dataset.getDomain(true);
                            DomainProperty d = domain.addProperty();
                            d.setPropertyURI(pd.getPropertyURI());
                            d.setRangeURI(pd.getRangeURI());
                            d.setName(pd.getName());
                            pdsToReparentInShared.add(pd);
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
                                messages.add("Incorrect propertyURI on optional property \"" + pd.getName() + "\" for dataset: " + dataset.getName() + ".  Needs to be updated.");
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
                }

                for (PropertyDescriptor pd : toUpdate)
                {
                    updatePropertyURI(domain, pd);
                }
            }

            if (commitChanges)
            {
                for (PropertyDescriptor sharedPD : pdsToReparentInShared)
                {
                    sharedPD.setContainer(ContainerManager.getSharedContainer());
                    OntologyManager.updatePropertyDescriptor(sharedPD);
                }
            }

            //ensure keymanagement type
            if (commitChanges)
            {
                SQLFragment sql = new SQLFragment("UPDATE study.dataset SET " + ColumnNames.KEY_MANAGEMENT_TYPE + "=?, " +
                    ColumnNames.KEY_PROPERTY_NAME + "=? WHERE " + ColumnNames.DEMOGRAPHIC_DATA + "=? AND container=?",
                    "GUID", ColumnNames.OBJECT_ID, false, c.getEntityId());
                long total = new SqlExecutor(StudyService.get().getDatasetSchema()).execute(sql);
                messages.add("Non-demographics datasets updated to use objectId as a managed key: " + total);
            }
            else
            {
                SQLFragment sql = new SQLFragment("SELECT * FROM study.dataset WHERE " + ColumnNames.KEY_MANAGEMENT_TYPE +
                    "!=? AND " + ColumnNames.DEMOGRAPHIC_DATA + "=? AND container=?", "GUID", false, c.getEntityId());
                long total = new SqlExecutor(StudyService.get().getDatasetSchema()).execute(sql);
                if (total > 0)
                    messages.add("Non-demographics datasets that are not using objectId as a managed key: " + total);
            }
            transaction.commit();
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (ChangePropertyDescriptorException e)
        {
            throw new RuntimeException(e);
        }

        // Fetch all the TableInfos outside of a transaction to reduce chances for deadlocks
        List<Pair<Dataset, TableInfo>> datasetTables = new ArrayList<>();
        for (Dataset d : study.getDatasets())
        {
            TableInfo realTable = StorageProvisioner.createTableInfo(d.getDomain());
            datasetTables.add(Pair.of(d, realTable));
        }

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            //add indexes
            String[][] toIndex = new String[][]{{ColumnNames.TASK_ID}};
            String[][] idxToRemove = new String[][]{
                {ColumnNames.DATE},
                {ColumnNames.PARENT_ID},
                {ColumnNames.OBJECT_ID},
                {ColumnNames.RUN_ID},
                {ColumnNames.REQUEST_ID}
            };

            Set<String> distinctIndexes = new HashSet<>();

            for (Pair<Dataset, TableInfo> datasetTable : datasetTables)
            {
                Dataset d = datasetTable.first;
                String tableName = d.getDomain().getStorageTableName();
                TableInfo realTable = datasetTable.second;

                List<String[]> toAdd = new ArrayList<>();
                Collections.addAll(toAdd, toIndex);

                List<String[]> toRemove = new ArrayList<>();
                Collections.addAll(toRemove, idxToRemove);

                if (realTable.getColumn(ColumnNames.VET_REVIEW) != null && !d.getName().equalsIgnoreCase(DatasetNames.DRUG))
                    toRemove.add(new String[]{ColumnNames.QC_STATE, ColumnNames.INCLUDE_PREFIX + ColumnNames.VET_REVIEW});

                if (d.getLabel().equalsIgnoreCase(DatasetNames.HOUSING))
                {
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID, ColumnNames.END_DATE});
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID, ColumnNames.INCLUDE_PREFIX + ColumnNames.DATE + "," + ColumnNames.CAGE + "," + ColumnNames.ROOM});
                    toAdd.add(new String[]{ColumnNames.LSID, ColumnNames.PARTICIPANT_ID});
                    toAdd.add(new String[]{ColumnNames.DATE, ColumnNames.LSID, ColumnNames.PARTICIPANT_ID});
                    toAdd.add(new String[]{ColumnNames.DATE, ColumnNames.INCLUDE_PREFIX + ColumnNames.LSID + "," + ColumnNames.PARTICIPANT_ID + "," + ColumnNames.CAGE + "," + ColumnNames.ROOM});
                    toAdd.add(new String[]{ColumnNames.OBJECT_ID});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.ASSIGNMENT))
                {
                    toAdd.add(new String[]{ColumnNames.PROJECT, ColumnNames.PARTICIPANT_ID, ColumnNames.END_DATE});
                    toAdd.add(new String[]{ColumnNames.END_DATE, ColumnNames.PROJECT});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.CLINPATH_RUNS))
                {
                    toAdd.add(new String[]{ColumnNames.PARENT_ID});
                    toAdd.add(new String[]{ColumnNames.OBJECT_ID});

                    toAdd.add(new String[]{ColumnNames.REQUEST_ID});
                    toRemove.remove(new String[]{ColumnNames.REQUEST_ID});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.CLINICAL_ENCOUNTERS))
                {
                    toAdd.add(new String[]{ColumnNames.CASE_NO});
                    toAdd.add(new String[]{ColumnNames.OBJECT_ID});

                    toAdd.add(new String[]{ColumnNames.REQUEST_ID});
                    toRemove.remove(new String[]{ColumnNames.REQUEST_ID});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.DEMOGRAPHICS))
                {
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID, ColumnNames.CALCULATED_STATUS});
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID + ":ASC", ColumnNames.INCLUDE_PREFIX + ColumnNames.DEATH});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.ANIMAL_RECORD_FLAGS))
                {
                    toRemove.add(new String[]{ColumnNames.PARTICIPANT_ID + ":ASC", ColumnNames.INCLUDE_PREFIX + ColumnNames.CATEGORY + "," + ColumnNames.VALUE});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.CLINICAL_REMARKS))
                {
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID, ColumnNames.LSID});
                    toRemove.add(new String[]{ColumnNames.PARTICIPANT_ID + ":ASC", ColumnNames.DATE + ":ASC", ColumnNames.LSID + ":ASC"});
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID + ":ASC", ColumnNames.DATE + ":ASC", ColumnNames.LSID + ":ASC",
                        ColumnNames.INCLUDE_PREFIX + ColumnNames.HX + "," + ColumnNames.QC_STATE + "," + ColumnNames.DATE_FINALIZED + "," + ColumnNames.CATEGORY});
                    toRemove.add(new String[]{ColumnNames.DATE, ColumnNames.INCLUDE_PREFIX + ColumnNames.HX + "," + ColumnNames.CASE_ID});
                    toAdd.add(new String[]{ColumnNames.OBJECT_ID});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.TREATMENT_ORDERS))
                {
                    toAdd.add(new String[]{ColumnNames.OBJECT_ID});

                    toAdd.add(new String[]{ColumnNames.REQUEST_ID});
                    toRemove.remove(new String[]{ColumnNames.REQUEST_ID});
                }
                else if (d.getLabel().equalsIgnoreCase(DatasetNames.CASES))
                {
                    toAdd.add(new String[]{ColumnNames.END_DATE, ColumnNames.QC_STATE, ColumnNames.LSID});
                    toAdd.add(new String[]{ColumnNames.PARTICIPANT_ID, ColumnNames.LSID, ColumnNames.ASSIGNED_VET});
                    toAdd.add(new String[]{ColumnNames.OBJECT_ID});
                }
                else if (d.getName().equalsIgnoreCase(DatasetNames.CLINICAL_OBSERVATIONS))
                {
                    toAdd.add(CLINICAL_OBSERVATIONS_INDEX_COLS);
                    for (String[] i : toAdd)
                    {
                        if (i.length < 2)
                            continue;

                        if (ColumnNames.PARTICIPANT_ID.equals(i[0]) && ColumnNames.DATE.equals(i[1]))
                        {
                            toAdd.remove(i);
                            break;
                        }
                    }

                    toRemove.add(CLINICAL_OBSERVATIONS_REGULAR_COLS);
                }
                else if (d.getName().equalsIgnoreCase(DatasetNames.DRUG))
                {
                    toAdd.add(new String[]{ColumnNames.TREATMENT_ID});

                    toRemove.add(new String[]{ColumnNames.QC_STATE, ColumnNames.INCLUDE_PREFIX + ColumnNames.TREATMENT_ID + "," + ColumnNames.VET_REVIEW});
                    toRemove.add(new String[]{ColumnNames.QC_STATE, ColumnNames.INCLUDE_PREFIX + ColumnNames.TREATMENT_ID});

                    toAdd.add(new String[]{ColumnNames.REQUEST_ID});
                    toRemove.remove(new String[]{ColumnNames.REQUEST_ID});
                }
                else if (d.getName().equalsIgnoreCase(DatasetNames.BLOOD))
                {
                    toAdd.add(new String[]{ColumnNames.REQUEST_ID});
                    toRemove.remove(new String[]{ColumnNames.REQUEST_ID});
                }

                //ensure indexes removed, unless explicitly requested by a table
                for (String[] cols : toRemove)
                {
                    String indexName = getIndexName(realTable.getSqlDialect(), tableName, cols);
                    boolean found = false;
                    for (String[] addedIndex : toAdd)
                    {
                        String addedIndexName = getIndexName(realTable.getSqlDialect(), tableName, addedIndex);
                        if (addedIndexName.equalsIgnoreCase(indexName))
                        {
                            found = true;
                            break;
                        }
                    }

                    if (found)
                    {
                        break;
                    }

                    boolean exists = doesIndexExist(realTable.getSchema(), tableName, indexName);
                    if (exists)
                    {
                        if (commitChanges)
                        {
                            dropIndex(realTable.getSchema(), realTable, indexName, Arrays.asList(cols), d.getLabel(), messages);
                        }
                        else
                        {
                            messages.add("Will drop index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + d.getLabel());
                        }
                    }
                }

                //then add indexes
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
                            missingCols = true;
                        }
                    }

                    if (includedCols != null)
                    {
                        for (String col : includedCols)
                        {
                            if (realTable.getColumn(col) == null)
                            {
                                missingCols = true;
                            }
                        }
                    }

                    if (missingCols)
                        continue;

                    String indexName = getIndexName(realTable.getSqlDialect(), tableName, indexCols);

                    if (distinctIndexes.contains(indexName))
                        throw new RuntimeException("An index has already been created with the name: " + indexName);
                    distinctIndexes.add(indexName);

                    Set<String> indexNames = new CaseInsensitiveHashSet();
                    DatabaseMetaData meta = realTable.getSchema().getScope().getConnection().getMetaData();

                    try (ResultSet rs = meta.getIndexInfo(realTable.getSchema().getScope().getDatabaseName(), realTable.getSchema().getName(), tableName, false, false))
                    {
                        while (rs.next())
                        {
                            indexNames.add(rs.getString("INDEX_NAME"));
                        }
                    }

                    boolean exists = indexNames.contains(indexName);
                    if (exists && rebuildIndexes)
                    {
                        if (commitChanges)
                        {
                            dropIndex(realTable.getSchema(), realTable, indexName, cols, d.getLabel(), messages);
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
                                if (realTable.getSqlDialect().isSqlServer() && directionMap.containsKey(name))
                                    name += " " + directionMap.get(name);

                                columns.add(name);
                            }

                            createIndex(realTable.getSchema(), realTable, d.getLabel(), indexName, columns, includedCols, messages);
                        }
                        else
                        {
                            messages.add("Missing index on column(s): " + StringUtils.join(indexCols, ", ") + " for dataset: " + d.getLabel());
                        }
                    }
                }

                //then disable if needed.  only attempt on SQLServer
                if (realTable.getSqlDialect().isSqlServer())
                {
                    if (!DatasetNames.DEMOGRAPHICS.equalsIgnoreCase(d.getName()))
                    {
                        PropertyStorageSpec.Index[] idxToDisable = new PropertyStorageSpec.Index[]{
                                new PropertyStorageSpec.Index(false, "participantsequencenum"),
                                new PropertyStorageSpec.Index(false, ColumnNames.QC_STATE)
                        };

                        for (PropertyStorageSpec.Index toDisable : idxToDisable)
                        {
                            String idxName = AliasManager.makeLegalName(tableName + '_' + StringUtils.join(toDisable.columnNames, "_"), DbScope.getLabKeyScope().getSqlDialect());
                            if (doesIndexExist(realTable.getSchema(), tableName, idxName))
                            {
                                messages.add("will disable index: " + tableName + "." + idxName);
                                if (commitChanges)
                                {
                                    new SqlExecutor(realTable.getSchema()).execute(new SQLFragment("ALTER INDEX " + idxName + " ON studydataset." + tableName + " DISABLE"));
                                }
                            }
                            else
                            {
                                _log.warn("unable to find index: " + tableName + "." + idxName);
                                String indexName = getIndexName(realTable.getSqlDialect(), tableName, toDisable.columnNames);
                                if (doesIndexExist(realTable.getSchema(), tableName, indexName))
                                {
                                    messages.add("will disable index: " + tableName + "." + indexName);
                                    if (commitChanges)
                                    {
                                        new SqlExecutor(realTable.getSchema()).execute(new SQLFragment("ALTER INDEX " + indexName + " ON studydataset." + tableName + " DISABLE"));
                                    }
                                }
                                else
                                {
                                    _log.warn("unable to find index: " + tableName + "." + indexName);
                                }
                            }
                        }
                    }
                }
            }

            createEHRLookupIndexes(messages, commitChanges, rebuildIndexes);

            //increase length of encounters remark col
            if (commitChanges && DbScope.getLabKeyScope().getSqlDialect().isSqlServer())
            {
                for (String label : new String[]{DatasetNames.CLINICAL_ENCOUNTERS, DatasetNames.GROSS_FINDINGS})
                {
                    Dataset ds = study.getDatasetByLabel(label);
                    if (ds != null)
                    {
                        _log.info("increasing size of " + ColumnNames.REMARK + " column for dataset: " + label);
                        SQLFragment sql = new SQLFragment("ALTER TABLE studydataset." + ds.getDomain().getStorageTableName() +
                            " ALTER COLUMN " + ColumnNames.REMARK + " NVARCHAR(max)");
                        SqlExecutor se = new SqlExecutor(DbScope.getLabKeyScope());
                        se.execute(sql);
                    }
                }
            }

            transaction.commit();

            Introspector.flushCaches();
            CacheManager.clearAllKnownCaches();
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }

        return messages;
    }

    private List<PropertyDescriptor> resolveProperties(Container c, Container sharedContainer, List<String> propertyURIs)
    {
        List<PropertyDescriptor> properties = new ArrayList<>();
        for (String propertyURI : propertyURIs)
        {
            resolveProperty(c, sharedContainer, properties, propertyURI);
        }
        return properties;
    }

    private void resolveProperty(Container c, Container sharedContainer, List<PropertyDescriptor> properties, String propertyURI)
    {
        PropertyDescriptor pd = OntologyManager.getPropertyDescriptor(propertyURI, sharedContainer);
        if (pd == null)
        {
            _log.error("PropertyDescriptor [" + propertyURI + "] is null for container: " + c.getPath());
            String sql = " SELECT * FROM " + OntologyManager.getTinfoPropertyDescriptor() + " WHERE PropertyURI LIKE '%#" + (propertyURI.split("#")[1]) + "'";
            PropertyDescriptor[] pdArray = new SqlSelector(OntologyManager.getExpSchema(), sql).getArray(PropertyDescriptor.class);
            if (pdArray.length > 0)
            {
                for (PropertyDescriptor p : pdArray)
                {
                    _log.error("found match in container: " + p.getContainer().getPath() + " [" + p.getPropertyURI() + "]");
                }
            }
            else
            {
                _log.error("no matching property descriptors found in database");
            }
        }
        else
        {
            properties.add(pd);
        }
    }

    //only sqlserver enterprise edition supports index compression.  team city is not enterprise
    private boolean isEnterpriseEdition(DbSchema schema)
    {
        SqlSelector ss = new SqlSelector(schema, new SQLFragment("select serverproperty('Edition')"));

        return ss.getObject(String.class).contains("Enterprise");
    }

    private String getIndexName(SqlDialect dialect, String tableName, String[] indexCols)
    {
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

        String indexName = tableName + "_" + StringUtils.join(cols, "_");
        if (includedCols != null && dialect.isSqlServer())
        {
            indexName += "_include_" + StringUtils.join(includedCols, "_");
        }

        return indexName;
    }

    private void createEHRLookupIndexes(List<String> messages, boolean commitChanges, boolean rebuildIndexes) throws SQLException
    {
        DbSchema schema = EHRSchema.getInstance().getEHRLookupsSchema();
        TableInfo realTable = schema.getTable("flag_values");
        String indexName = "flag_values_container_category_objectid";
        List<String> cols = Arrays.asList("container", ColumnNames.CATEGORY, ColumnNames.OBJECT_ID);

        boolean exists = doesIndexExist(schema, "flag_values", indexName);

        if (commitChanges && (!exists || rebuildIndexes))
        {
            if (exists)
                dropIndex(schema, realTable, indexName, cols, indexName, messages);

            createIndex(schema, realTable, indexName, indexName, cols, new String[]{ColumnNames.VALUE}, messages);
        }
        else if ((!exists || rebuildIndexes))
        {
            if (exists)
                messages.add("Will drop index on column(s): container, " + ColumnNames.CATEGORY + ", " + ColumnNames.OBJECT_ID + " for table: ehr_lookups.flag_values");

            messages.add("Will create index on column(s): container, " + ColumnNames.CATEGORY + ", " + ColumnNames.OBJECT_ID + " for table: ehr_lookups.flag_values");
        }
    }

    private void createIndex(DbSchema schema, TableInfo realTable, String tableName, String indexName, List<String> columns, String[] includedCols, List<String> messages)
    {
        messages.add("Creating index on column(s): " + StringUtils.join(columns, ", ") + " for table: " + tableName);
        String sqlString = "CREATE INDEX " + indexName + " ON " + realTable.getSelectName() + "(" + StringUtils.join(columns, ", ") + ")";
        if (schema.getSqlDialect().isSqlServer() && isEnterpriseEdition(schema))
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
        try (ResultSet rs = meta.getIndexInfo(schema.getScope().getDatabaseName(), schema.getName(), tableName, false, false))
        {
            while (rs.next())
            {
                indexNames.add(rs.getString("INDEX_NAME"));
            }
        }

        return indexNames.contains(indexName);
    }

    private void dropIndex(DbSchema schema, TableInfo realTable, String indexName, List<String> cols, String tableName, List<String> messages)
    {
        messages.add("Dropping index on column(s): " + StringUtils.join(cols, ", ") + " for dataset: " + tableName);
        String sqlString;
        if (realTable.getSqlDialect().isSqlServer())
        {
            sqlString = "DROP INDEX " + indexName + " ON " + realTable.getSelectName();
        }
        else
        {
            sqlString = "DROP INDEX " + schema.getName() + "." + indexName;
        }
        SQLFragment sql = new SQLFragment(sqlString);
        SqlExecutor se = new SqlExecutor(schema);
        se.execute(sql);
    }

    /**
     * Configuration for a dataset index that can be dropped and recreated.
     */
    private static class DatasetIndexConfig
    {
        final String datasetName;
        final String[] indexCols;
        final String[] regularCols;
        final String[] includedCols;

        DatasetIndexConfig(String datasetName, String[] indexCols, String[] regularCols, String[] includedCols)
        {
            this.datasetName = datasetName;
            this.indexCols = indexCols;
            this.regularCols = regularCols;
            this.includedCols = includedCols;
        }
    }

    // Registry of dataset index configurations - supports multiple indices per dataset
    private static final List<DatasetIndexConfig> DATASET_INDEX_CONFIGS = new ArrayList<>();
    static
    {
        // Register clinical_observations index configuration
        DATASET_INDEX_CONFIGS.add(
            new DatasetIndexConfig(
                DatasetNames.CLINICAL_OBSERVATIONS,
                CLINICAL_OBSERVATIONS_INDEX_COLS,
                CLINICAL_OBSERVATIONS_REGULAR_COLS,
                CLINICAL_OBSERVATIONS_INCLUDED_COLS
            )
        );
        // Additional dataset index configurations can be registered here
        // DATASET_INDEX_CONFIGS.add(new DatasetIndexConfig(DatasetNames.CLINICAL_OBSERVATIONS, ...));
    }

    /**
     * Context holder for EHR index operations on the index datasets.
     */
    private static class EHRIndexContext
    {
        final Dataset dataset;
        final TableInfo realTable;
        final String tableName;
        final DbSchema schema;
        final String indexName;
        final List<String> cols;
        final String[] includedCols;

        EHRIndexContext(Dataset dataset, TableInfo realTable, String tableName, DbSchema schema, String indexName, List<String> cols, String[] includedCols)
        {
            this.dataset = dataset;
            this.realTable = realTable;
            this.tableName = tableName;
            this.schema = schema;
            this.indexName = indexName;
            this.cols = cols;
            this.includedCols = includedCols;
        }
    }

    /**
     * Prepares the context for EHR index operations on datasets.
     * @param c Container
     * @param config Dataset index configuration
     * @param messages List to add error messages to
     * @return the context, or null if study or dataset is not found (messages will be populated with the reason)
     */
    @Nullable
    private EHRIndexContext prepareEHRIndexContext(Container c, DatasetIndexConfig config, List<String> messages)
    {
        Study study = StudyService.get().getStudy(c);
        if (study == null)
        {
            messages.add("No study in this folder");
            return null;
        }

        Dataset dataset = study.getDatasetByName(config.datasetName);
        if (dataset == null)
        {
            messages.add(config.datasetName + " dataset not found");
            return null;
        }

        TableInfo realTable = StorageProvisioner.createTableInfo(dataset.getDomain());
        String tableName = dataset.getDomain().getStorageTableName();
        DbSchema schema = realTable.getSchema();

        String indexName = getIndexName(schema.getSqlDialect(), tableName, config.indexCols);

        List<String> cols = Arrays.asList(config.regularCols);

        return new EHRIndexContext(dataset, realTable, tableName, schema, indexName, cols, config.includedCols);
    }

    /**
     * Drop indices for all registered EHR datasets.
     * @param c Container
     * @param u User
     */
    public List<String> dropEHRIndices(Container c, User u)
    {
        List<String> messages = new ArrayList<>();

        for (DatasetIndexConfig config : DATASET_INDEX_CONFIGS)
        {
            messages.addAll(dropEHRIndex(c, u, config));
        }

        return messages;
    }

    /**
     * Drop a specific index configuration.
     * @param c Container
     * @param u User
     * @param config Index configuration
     */
    private List<String> dropEHRIndex(Container c, User u, DatasetIndexConfig config)
    {
        List<String> messages = new ArrayList<>();

        EHRIndexContext ctx = prepareEHRIndexContext(c, config, messages);
        if (ctx == null)
        {
            return messages;
        }

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            boolean exists = doesIndexExist(ctx.schema, ctx.tableName, ctx.indexName);
            if (exists)
            {
                dropIndex(ctx.schema, ctx.realTable, ctx.indexName, ctx.cols, ctx.dataset.getLabel(), messages);
                messages.add("Successfully dropped " + config.datasetName + " index: " + ctx.indexName);
            }
            else
            {
                messages.add("Index does not exist: " + ctx.indexName);
            }

            transaction.commit();
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }

        return messages;
    }

    /**
     * Add indices for all registered EHR datasets.
     * @param c Container
     * @param u User
     */
    public List<String> addEHRIndices(Container c, User u)
    {
        List<String> messages = new ArrayList<>();

        for (DatasetIndexConfig config : DATASET_INDEX_CONFIGS)
        {
            messages.addAll(addEHRIndex(c, u, config));
        }

        return messages;
    }

    /**
     * Add a specific index configuration.
     * @param c Container
     * @param u User
     * @param config Index configuration
     */
    private List<String> addEHRIndex(Container c, User u, DatasetIndexConfig config)
    {
        List<String> messages = new ArrayList<>();

        EHRIndexContext ctx = prepareEHRIndexContext(c, config, messages);
        if (ctx == null)
        {
            return messages;
        }

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            boolean exists = doesIndexExist(ctx.schema, ctx.tableName, ctx.indexName);
            if (exists)
            {
                messages.add("Index already exists: " + ctx.indexName);
            }
            else
            {
                createIndex(ctx.schema, ctx.realTable, ctx.dataset.getLabel(), ctx.indexName, ctx.cols, ctx.includedCols, messages);
                messages.add("Successfully created " + config.datasetName + " index: " + ctx.indexName);
            }

            transaction.commit();
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }

        return messages;
    }

    //the module's SQL scripts create indexes, but apparently only SQL server enterprise supports compression,
    //so this code will let admins compress them after the fact
    public void compressEHRSchemaIndexes()
    {
        if (!DbScope.getLabKeyScope().getSqlDialect().isSqlServer() && isEnterpriseEdition(EHRSchema.getInstance().getSchema()))
        {
            _log.error("Index compression on EHR can only be performed on SQL server currently.");
            return;
        }

        _log.info("Compressing indexes on select EHR schema tables");

        List<Pair<String, String[]>> names = new ArrayList<>();
        names.add(Pair.of("encounter_flags", new String[]{"objectid"}));
        names.add(Pair.of("encounter_flags", new String[]{"parentid"}));
        names.add(Pair.of("encounter_flags", new String[]{"id"}));

        names.add(Pair.of("encounter_participants", new String[]{"parentid"}));
        names.add(Pair.of("encounter_participants", new String[]{"id"}));
        names.add(Pair.of("encounter_participants", new String[]{"taskid"}));

        names.add(Pair.of("encounter_summaries", new String[]{"id"}));
        names.add(Pair.of("encounter_summaries", new String[]{"container", "objectid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"container", "parentid"}));
        names.add(Pair.of("encounter_summaries", new String[]{"taskid"}));

        names.add(Pair.of("snomed_tags", new String[]{"taskid"}));
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
        SQLFragment sql = new SQLFragment("ALTER INDEX " + indexName + " ON ehr." + table + " REBUILD WITH (DATA_COMPRESSION = ROW)");
        SqlExecutor se = new SqlExecutor(ehr);
        se.execute(sql);
    }
    
    //NOTE: this assumes the property already exists
    private void updatePropertyURI(Domain d, PropertyDescriptor pd) throws SQLException
    {
        DbSchema expSchema = ExperimentService.get().getSchema();
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
        List<Integer> oldIds = new ArrayList<>();

        try (TableResultSet results = selector.getResultSet())
        {
            while (results.next())
            {
                Map<String, Object> row = results.getRowMap();
                oldIds.add((Integer) row.get("propertyid"));
            }
        }

        if (oldIds.isEmpty())
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

            PropertyDescriptor toDelete = OntologyManager.getPropertyDescriptor(oldIds.get(0));
            if (toDelete != null)
            {
                PropertyService.get().deleteValidatorsAndFormats(toDelete.getContainer(), toDelete.getPropertyId());
                OntologyManager.deletePropertyDescriptor(toDelete);
            }
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

            oldIds.remove(propertyId);
            for (Integer id : oldIds)
            {
                PropertyDescriptor toDelete = OntologyManager.getPropertyDescriptor(id);
                if (toDelete != null)
                {
                    PropertyService.get().deleteValidatorsAndFormats(toDelete.getContainer(), toDelete.getPropertyId());
                    OntologyManager.deletePropertyDescriptor(toDelete);
                }
            }

            String deleteSql2 = "DELETE FROM exp.propertydomain WHERE propertyid != ? AND domainId = ? AND propertyid IN ? AND sortorder != ?";
            executor.execute(deleteSql2, propertyId, d.getTypeId(), oldIds, minSort);
        }
    }

    public Map<String, Map<String, Object>> getAnimalDetails(User u, Container c, String[] animalsIds, Set<String> extraSources)
    {
        Map<String, Map<String, Object>> ret = new HashMap<>();

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
        for (final TableInfo ti : def.getTables())
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
            ts.forEachMap(new Selector.ForEachBlock<>()
            {
                @Override
                public void exec(Map<String, Object> map)
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
                    ti.getUpdateService().deleteRows(u, c, keysToDelete, null, new HashMap<>());
                }


                if (!requestsToQueue.isEmpty())
                {
                    BatchValidationException batchValidationException = new BatchValidationException();
                    ti.getUpdateService().updateRows(u, c, requestsToQueue, requestsToQueue, batchValidationException, null, new HashMap<>());
                    if (batchValidationException.hasErrors())
                        throw batchValidationException;
                }
            }
            catch (InvalidKeyException | QueryUpdateServiceException | BatchValidationException e)
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
        Set<TableInfo> distinctTables = def.getTables();
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
        SQLFragment sql = new SQLFragment("SELECT * FROM core.datastates qc LEFT JOIN ehr.qcstatemetadata md ON (qc.label = md.QCStateLabel) WHERE qc.container = ?", c.getEntityId());
        DbSchema db = DbSchema.get("study");
        return new SqlSelector(db, sql).getArray(EHRQCStateImpl.class);
    }

    @NotNull
    public Collection<String> ensureFlagActive(User u, Container c, String flag, Date date, @Nullable Date enddate, String remark, Collection<String> toTest, boolean livingAnimalsOnly) throws BatchValidationException
    {
        final List<String> animalIds = new ArrayList<>(toTest);

        TableInfo flagsTable = getEHRTable(c, u, "study", "flags");
        if (flagsTable == null)
        {
            throw new IllegalArgumentException("Unable to find flags table in container: " + c.getPath());
        }

        //find animals already with this flag on this date
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("flag"), flag);
        filter.addCondition(FieldKey.fromString("Id"), animalIds, CompareType.IN);
        //note: this is done to accommodate future dates, since enddateCoalesced would convert open-ended records to today
        filter.addClause(new SimpleFilter.OrClause(
            new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.DATE_GTE, date),
            new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.ISBLANK, null)
        ));
        filter.addCondition(FieldKey.fromString("date"), date, CompareType.DATE_LTE);

        TableSelector ts =  new TableSelector(flagsTable, PageFlowUtil.set("lsid", "Id", "date", "enddate", "remark"), filter, null);
        ts.forEach(new Selector.ForEachBlock<>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                animalIds.remove(rs.getString("Id"));
            }
        });

        TableInfo ti = getEHRTable(c, u, "study", "demographics");

        //limit to IDs present at the center
        if (livingAnimalsOnly)
        {
            SimpleFilter filter2 = new SimpleFilter(FieldKey.fromString("Id"), animalIds, CompareType.IN);
            filter2.addCondition(FieldKey.fromString("calculated_status"), "Alive", CompareType.EQUAL);
            TableSelector demographics = new TableSelector(ti, PageFlowUtil.set("Id"), filter2, null);

            animalIds.retainAll(demographics.getCollection(String.class));
        }

        try
        {
            //then insert rows
            List<Map<String, Object>> rows = new ArrayList<>();
            for (String animal : animalIds)
            {
                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                row.put("Id", animal);
                row.put("date", date);
                if (enddate != null)
                {
                    row.put("enddate", enddate);
                }
                row.put("remark", remark);
                row.put("flag", flag);
                row.put("performedby", u.getDisplayName(u));

                rows.add(row);
            }

            BatchValidationException errors = new BatchValidationException();
            if (!rows.isEmpty())
                flagsTable.getUpdateService().insertRows(u, flagsTable.getUserSchema().getContainer(), rows, errors, null, getExtraContext());

            if (errors.hasErrors())
                throw errors;

            return animalIds;
        }
        catch (QueryUpdateServiceException | DuplicateKeyException e)
        {
            _log.error("problem adding flags", e);
            throw new RuntimeException(e);
        }
        catch (SQLException e)
        {
            _log.error("problem adding flags", e);
            throw new RuntimeSQLException(e);
        }
    }

    private TableInfo getEHRTable(Container c, User u, String schema, String query)
    {
        Container ehrContainer = EHRService.get().getEHRStudyContainer(c);
        if (ehrContainer != null)
        {
            UserSchema us = QueryService.get().getUserSchema(u, ehrContainer, schema);
            if (us == null)
            {
                return null;
            }

            return us.getTable(query);
        }

        return null;
    }

    @NotNull
    public Collection<String> terminateFlagsIfExists(User u, Container c, String flag, final Date enddate, Collection<String> animalIds)
    {
        TableInfo flagsTable = getEHRTable(c, u, "study", "flags");
        if (flagsTable == null)
        {
            throw new IllegalArgumentException("Unable to find flags table in container: " + c.getPath());
        }

        final List<Map<String, Object>> rows = new ArrayList<>();
        final List<Map<String, Object>> oldKeys = new ArrayList<>();
        final Set<String> distinctIds = new HashSet<>();

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("flag"), flag);
        filter.addCondition(FieldKey.fromString("Id"), animalIds, CompareType.IN);
        filter.addCondition(FieldKey.fromString("isActive"), true);
        TableSelector ts = new TableSelector(flagsTable, PageFlowUtil.set("lsid", "Id", "date", "enddate", "remark"), filter, null);
        ts.forEach(new Selector.ForEachBlock<>()
        {
            @Override
            public void exec(ResultSet rs) throws SQLException
            {
                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                row.put("enddate", enddate);
                rows.add(row);

                Map<String, Object> keys = new CaseInsensitiveHashMap<>();
                keys.put("lsid", rs.getString("lsid"));
                oldKeys.add(keys);

                distinctIds.add(rs.getString("Id"));
            }
        });

        try
        {
            if (!rows.isEmpty())
            {
                BatchValidationException batchValidationException = new BatchValidationException();
                flagsTable.getUpdateService().updateRows(u, flagsTable.getUserSchema().getContainer(), rows, oldKeys, batchValidationException, null, getExtraContext());
                if (batchValidationException.hasErrors())
                    throw batchValidationException;
            }

            return distinctIds;
        }
        catch (InvalidKeyException | BatchValidationException | QueryUpdateServiceException e)
        {
            throw new RuntimeException(e);
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    public Map<String, Object> getExtraContext()
    {
        Map<String, Object> map = new HashMap<>();
        map.put("quickValidation", true);
        map.put("generatedByServer", true);

        return map;
    }

    public List<String> validateDatasetCols(Container c, User u, File xml) throws IOException, XmlException
    {
        Study s = StudyService.get().getStudy(c);
        if (s == null)
        {
            return Collections.emptyList();
        }

        TablesDocument doc = TablesDocument.Factory.parse(xml);
        TablesType tablesXml = doc.getTables();

        Map<String, Set<String>> datasetMap = new HashMap<>();
        for (TableType tableXml : tablesXml.getTableArray())
        {
            String datasetName = tableXml.getTableName();
            Set<String> colsExpected = new TreeSet<>();
            TableType.Columns cols = tableXml.getColumns();
            for (ColumnType ct : cols.getColumnArray())
            {
                colsExpected.add(ct.getColumnName());
            }

            datasetMap.put(datasetName, colsExpected);
        }


        List<String> ret = new ArrayList<>();
        Set<String> skipped = PageFlowUtil.set("Container", "Created", "CreatedBy", "Dataset", "Modified", "ModifiedBy", "ParticipantSequenceNum", "SequenceNum", "_key", "lsid", "qcstate", "sourcelsid", "formSort", "project");
        for (Dataset ds : s.getDatasets())
        {
            TableInfo ti = ds.getTableInfo(u);
            Set<String> names = new TreeSet<>(ti.getColumnNameSet());

            if (!datasetMap.containsKey(ds.getName()))
            {
                ret.add("No expected columns found for dataset: " + ds.getName());
            }
            else
            {
                Set<String> diff = new HashSet<>(Sets.difference(names, datasetMap.get(ds.getName())));
                diff.removeAll(skipped);
                if (!diff.isEmpty())
                {
                    ret.add("columns not expected in dataset " + ds.getName() + ": " + StringUtils.join(diff, ", "));
                }

                Set<String> diff2 = new HashSet<>(Sets.difference(datasetMap.get(ds.getName()), names));
                diff2.removeAll(skipped);
                if (!diff2.isEmpty())
                {
                    ret.add("columns missing from dataset " + ds.getName() + ": " + StringUtils.join(diff2, ", "));
                }
            }
        }

        return ret;
    }

    private final String LOCK_PROP_KEY = getClass().getName() + "||animalLock";

    public void lockAnimalCreation(Container c, User u, Boolean lock, Integer startingId, Integer idCount)
    {
        WritablePropertyMap map = PropertyManager.getWritableProperties(c, LOCK_PROP_KEY, true);
        map.put("lockedBy", u.getDisplayName(u));
        map.put("locked", lock.toString());
        map.put("lockDate", new SimpleDateFormat(LookAndFeelProperties.getInstance(c).getDefaultDateTimeFormat()).format(new Date()));
        map.put("startingId", (startingId == null ? null : startingId.toString()));
        map.put("idCount", (idCount == null ? null : idCount.toString()));
        map.save();
    }

    public Map<String, Object> getAnimalLockProperties(Container c)
    {
        Map<String, String> props = PropertyManager.getProperties(c, LOCK_PROP_KEY);
        Map<String, Object> ret = new HashMap<>();
        if (props != null && !props.isEmpty())
        {
            if (props.containsKey("lockedBy"))
                ret.put("lockedBy", props.get("lockedBy"));

            if (props.containsKey("locked"))
                ret.put("locked", Boolean.parseBoolean(props.get("locked")));

            if (props.containsKey("lockDate"))
            {
                try
                {
                    ret.put("lockDate", new SimpleDateFormat(LookAndFeelProperties.getInstance(c).getDefaultDateTimeFormat()).parse(props.get("lockDate")));
                }
                catch (ParseException e)
                {
                    //ignore
                }
            }

            if (props.containsKey("startingId"))
                ret.put("startingId", Integer.parseInt(props.get("startingId")));

            if (props.containsKey("idCount"))
                ret.put("idCount", Integer.parseInt(props.get("idCount")));
        }

        return ret;
    }
}
