/*
 * Copyright (c) 2012-2013 LabKey Corporation
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
package org.labkey.ehr.utils;

import org.apache.commons.beanutils.ConversionException;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.time.DateUtils;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.json.JSONArray;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Aggregate;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.ConvertHelper;
import org.labkey.api.data.DbSchema;
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
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.Group;
import org.labkey.api.security.GroupManager;
import org.labkey.api.security.MemberType;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.settings.AppProps;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.GUID;
import org.labkey.api.util.JobRunner;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.EHRSchema;
import org.labkey.ehr.demographics.AnimalRecord;
import org.labkey.ehr.demographics.DemographicsCache;
import org.labkey.ehr.security.EHRSecurityManager;

import javax.mail.Message;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * User: bbimber
 * Date: 3/1/12
 * Time: 7:23 AM
 */
public class TriggerScriptHelper
{
    private Container _container = null;
    private User _user = null;

    //NOTE: consider moving these to SharedCache, to allow them to be shared across scripts, yet reset from admin console
    private Map<String, Map<String, Object>> _weightRanges = new HashMap<String, Map<String, Object>>();
    private Map<String, Map<String, Object>> _bloodDrawServices = null;
    private Map<String, Map<String, Object>> _labworkServices = null;
    private Map<Integer, String> _cachedAccounts = new HashMap<>();

    private static final Logger _log = Logger.getLogger(TriggerScriptHelper.class);

    private TriggerScriptHelper(int userId, String containerId)
    {
        _user = UserManager.getUser(userId);
        if (_user == null)
            throw new RuntimeException("User does not exist: " + userId);

        _container = ContainerManager.getForId(containerId);
        if (_container == null)
            throw new RuntimeException("Container does not exist: " + containerId);

        Study study = getStudy();
        if (study == null)
            throw new RuntimeException("No study found in container: " + containerId);
    }

    private User getUser()
    {
        return _user;
    }

    private Container getContainer()
    {
        return _container;
    }

    private Study getStudy()
    {
        return StudyService.get().getStudy(getContainer());
    }

    public static TriggerScriptHelper create(int userId, String containerId)
    {
        //_log.info("Creating trigger script helper for: " +  userId + ", " + containerId);
        TriggerScriptHelper helper = new TriggerScriptHelper(userId, containerId);

        return helper;
    }

    public void closeActiveDatasetRecords(List<String> queryNames, String id, Date enddate)
    {
        Container container = getContainer();
        User user = getUser();

        for (String queryName : queryNames)
        {
            int datasetId = StudyService.get().getDatasetIdByLabel(container, queryName);
            DataSet dataset = StudyService.get().getDataSet(container, datasetId);
            if(dataset == null){
                _log.warn("Non existent table: study." + queryName);
                continue;
            }

            //TODO: this is done direct to the DB for speed.  however we lose auditing, etc.
            //might want to reconsider
            TableInfo ti = dataset.getTableInfo(user);
            SQLFragment sql = new SQLFragment("UPDATE studydataset." + dataset.getDomain().getStorageTableName() + " SET enddate = ? WHERE participantid = ? AND enddate IS NULL", enddate, id);
            new SqlExecutor(ti.getSchema()).execute(sql);
        }
    }

    public static List<String> getScriptsToLoad(String containerId)
    {
        Container c = ContainerManager.getForId(containerId);

        List<String> scripts = new ArrayList<>();
        for (Resource script : EHRService.get().getExtraTriggerScripts(c))
        {
            scripts.add(script.getPath().toString());
        }

        return Collections.unmodifiableList(scripts);
    }

    public boolean hasPermission(String schemaName, String queryName, String eventName, String originalQCState, String targetQCState)
    {
        return EHRSecurityManager.get().hasPermission(getContainer(), getUser(), schemaName, queryName, EHRSecurityManager.EVENT_TYPE.valueOf(eventName), originalQCState, targetQCState);
    }

    public String getQCStateJson() throws Exception
    {
        try
        {
            Map<String, EHRQCState> qcStates = EHRSecurityManager.get().getQCStateInfo(getContainer());

            JSONArray json = new JSONArray();
            for (EHRQCState qc : qcStates.values())
            {
                json.put(qc.toJson());
            }
            return json.toString();
        }
        catch (Exception e)
        {
            //NOTE: this is only called by JS triggers, which will bury the exception otherwise
            _log.error(e.getMessage());
            _log.error(e.getStackTrace());
            throw(e);
        }
    }

    public EHRQCState getQCStateForRowId(int rowId)
    {
        Map<String, EHRQCState> qcStates = EHRSecurityManager.get().getQCStateInfo(getContainer());

        for (EHRQCState qc : qcStates.values())
        {
            if (qc.getRowId() == rowId)
                return qc;

        }
        return null;
    }

    public EHRQCState getQCStateForLabel(String label)
    {
        Map<String, EHRQCState> qcStates = EHRSecurityManager.get().getQCStateInfo(getContainer());

        if (qcStates.containsKey(label))
            return qcStates.get(label);
        else
            return null;
    }

    public static void cascadeDelete(int userId, String containerId, String schemaName, String queryName, String keyField, Object keyValue) throws SQLException
    {
        cascadeDelete(userId, containerId, schemaName, queryName, keyField, keyValue, null);
    }

    public static void cascadeDelete(int userId, String containerId, String schemaName, String queryName, String keyField, Object keyValue, String sql) throws SQLException
    {
        User u = UserManager.getUser(userId);
        if (u == null)
            throw new RuntimeException("User does not exist: " + userId);

        Container c = ContainerManager.getForId(containerId);
        if (c == null)
            throw new RuntimeException("Container does not exist: " + containerId);

        DbSchema schema = QueryService.get().getUserSchema(u, c, schemaName).getDbSchema();
        if (schema == null)
            throw new RuntimeException("Unknown schema: " + schemaName);

        TableInfo table = schema.getTable(queryName);
        if (table == null)
            throw new RuntimeException("Unknown table: " + schemaName + "." + queryName);

        if (!c.hasPermission(u, DeletePermission.class))
            throw new UnauthorizedException("User does not have permission to delete from the table: " + table.getPublicName());

        SimpleFilter filter;
        if(sql == null)
        {
            filter = new SimpleFilter(FieldKey.fromString(keyField), keyValue);
        }
        else
        {
            filter = new SimpleFilter();
            filter.addWhereClause(sql, new Object[]{keyValue}, FieldKey.fromParts(keyField));
        }
        Table.delete(table, filter);
    }

    public AnimalRecord getDemographicRecord(String id)
    {
        return DemographicsCache.get().getAnimal(getContainer(), getUser(), id);
    }

    public void uncacheDemographicRecords(String[] ids)
    {
        DemographicsCache.get().uncacheRecords(getContainer(), Arrays.asList(ids));
    }

    public String validateAssignment(String id, Integer projectId, Date date) throws SQLException
    {
        if (id == null || projectId == null || date == null)
            return null;

        TableInfo ti = getTableInfo("study", "Assignment");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id);

        filter.addCondition(FieldKey.fromString("project"), projectId);
        filter.addCondition(FieldKey.fromString("date"), date, CompareType.DATE_LTE);

        filter.addClause(new SimpleFilter.OrClause(new CompareType.EqualsCompareClause(FieldKey.fromString("enddate"), CompareType.DATE_GTE, date), new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.ISBLANK, null)));
        filter.addCondition(FieldKey.fromString("qcstate/publicdata"), true, CompareType.EQUAL);

        Set<FieldKey> keys = PageFlowUtil.set(FieldKey.fromString("project"), FieldKey.fromString("project"), FieldKey.fromString("project/protocol"));
        Map<FieldKey, ColumnInfo> cols = QueryService.get().getColumns(ti, keys);
        TableSelector ts = new TableSelector(ti, cols.values(), filter, null);

        try (Results ret = ts.getResults())
        {
            if (!ret.next())
                return "Not assigned to the project on this date";

            if (ret.getString(FieldKey.fromString("project/protocol")) == null)
            {
                return "This project is not associated with a valid protocol";
            }
        }

        return null;
    }

    public String getAccountForProject(int projectId)
    {
        if (_cachedAccounts.containsKey(projectId))
            return _cachedAccounts.get(projectId);

        TableInfo ti = getTableInfo("ehr", "project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("project"), projectId);
        TableSelector ts = new TableSelector(ti, Collections.singleton("account"), filter, null);

        String[] ret = ts.getArray(String.class);
        if (ret.length != 1)
            return null;

        _cachedAccounts.put(projectId, ret[0]);

        return ret[0];
    }

    private TableInfo getTableInfo(String schema, String query)
    {
        UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), schema);
        if (us == null)
            throw new IllegalArgumentException("Unable to find schema: " + schema);

        TableInfo ti = us.getTable(query);
        if (ti == null)
            throw new IllegalArgumentException("Unable to find table: " + schema + "." + query);

        return ti;
    }

    public String getSnomedMeaning(String code)
    {
        if (code == null)
            return null;

        TableInfo ti = EHRSchema.getInstance().getEHRLookupsSchema().getTable(EHRSchema.TABLE_SNOMED);
        TableSelector ts = new TableSelector(ti, Collections.singleton("meaning"), new SimpleFilter(FieldKey.fromString("code"), code), null);
        String[] ret = ts.getArray(String.class);
        if (ret != null && ret.length == 1)
            return ret[0];

        return null;
    }

    public boolean validateHousing(String id, String room, String cage, Date date)
    {
        if (id == null || room == null || date == null)
            return true;

        TableInfo ti = getTableInfo("study", "Housing");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id);
        filter.addCondition(FieldKey.fromString("room"), room, CompareType.EQUAL);
        if (cage != null)
            filter.addCondition(FieldKey.fromString("cage"), cage, CompareType.EQUAL);

        filter.addCondition(FieldKey.fromString("date"), date, CompareType.LTE);
        filter.addClause(new SimpleFilter.OrClause(new CompareType.EqualsCompareClause(FieldKey.fromString("enddate"), CompareType.GT, date), new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.ISBLANK, null)));
        filter.addCondition(FieldKey.fromString("qcstate/publicdata"), true, CompareType.EQUAL);

        TableSelector ts = new TableSelector(ti, Collections.singleton("Id"), filter, null);
        return ts.getRowCount() > 0;
    }

    public String getProtocolForProject(Integer project)
    {
        if (project == null)
            return null;

        TableInfo ti = getTableInfo("ehr", "project");
        TableSelector ts = new TableSelector(ti, Collections.singleton("protocol"), new SimpleFilter(FieldKey.fromString("project"), project), null);
        String[] ret = ts.getArray(String.class);
        if (ret.length == 1)
            return ret[0];

        return null;
    }

    public String lookupDatasetForService(String service)
    {
        Map<String, Map<String, Object>> map = getLabworkServices();
        if (map.containsKey(service))
            return (String)map.get(service).get("dataset");

        return null;
    }

    public String lookupChargeTypeForService(String service)
    {
        Map<String, Map<String, Object>> map = getLabworkServices();
        if (map.containsKey(service))
            return (String)map.get(service).get("chargetype");

        return null;
    }

    public Map<String, Map<String, Object>> getLabworkServices()
    {
        if (_labworkServices == null)
        {
            TableInfo ti = getTableInfo("ehr_lookups", "labwork_services");
            TableSelector ts = new TableSelector(ti);
            final Map<String, Map<String, Object>> ret = new HashMap<String, Map<String, Object>>();
            for (Map<String, Object> row : ts.getMapArray())
            {
                ret.put((String)row.get("servicename"), row);
            }

            _labworkServices = ret;
        }

        return _labworkServices;
    }

    public Map<String, Object> getWeightRangeForSpecies(String species)
    {
        if (_weightRanges.containsKey(species))
            return _weightRanges.get(species);

        TableInfo ti = getTableInfo("ehr_lookups", "weight_ranges");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("species"), species, CompareType.EQUAL);
        TableSelector ts = new TableSelector(ti, Table.ALL_COLUMNS, filter, null);
        Map<String, Object>[] ret = ts.getMapArray();

        if (ret.length > 1)
        {
            _log.warn("More than 1 row returned from ehr_lookups.weight_ranges for the species: " + species);
            return null;
        }
        else if (ret.length == 0)
        {
            return null;
        }

        _weightRanges.put(species, ret[0]);

        return _weightRanges.get(species);
    }

    public String verifyWeightRange(String id, Double weight, String species)
    {
        if (species == null)
            return null;

        if (weight == null)
            return null;


        Map<String, Object> row = getWeightRangeForSpecies(species);
        if (row == null)
            return null;

        Double minWeight = (Double)row.get("min_weight");
        Double maxWeight = (Double)row.get("max_weight");
        if (minWeight != null && weight < minWeight)
        {
            return "Weight below the allowable value of " + minWeight + " kg for " + species;
        }

        if (maxWeight != null && weight > maxWeight)
        {
            return "Weight above the allowable value of " + maxWeight + " kg for " + species;
        }

        return null;
    }

    public void announceIdsModified(String schema, String query, List<String> ids)
    {
        DemographicsCache.get().reportDataChange(getContainer(), schema, query, ids);
        DemographicsCache.get().asyncCache(getContainer(), ids);
    }

    public void insertWeight(String id, Date date, Double weight) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException
    {
        if (id == null || date == null || weight == null)
            return;

        TableInfo ti = getTableInfo("study", "weight");

        Map<String, Object> row = new CaseInsensitiveHashMap<>();
        row.put("Id", id);
        row.put("date", date);
        row.put("weight", weight);

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(row);
        BatchValidationException errors = new BatchValidationException();
        ti.getUpdateService().insertRows(getUser(), getContainer(), rows, errors, getExtraContext());

    }

    public void createHousingRecord(String id, Date date, @Nullable String enddate, String room, @Nullable String cage) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException
    {
        if (id == null || date == null || room == null)
            return;

        TableInfo ti = getTableInfo("study", "housing");

        Map<String, Object> row = new CaseInsensitiveHashMap<>();
        row.put("Id", id);
        row.put("date", date);
        row.put("room", room);

        if (enddate != null)
            row.put("enddate", enddate);

        if (cage != null)
            row.put("cage", cage);

        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        rows.add(row);
        BatchValidationException errors = new BatchValidationException();
        ti.getUpdateService().insertRows(getUser(), getContainer(), rows, errors, getExtraContext());
    }

    public void createBirthRecord(String id, Map<String, Object> props) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException
    {
        if (id == null)
            return;

        TableInfo ti = getTableInfo("study", "birth");
        Map<String, Object> row = new CaseInsensitiveHashMap<Object>();
        row.putAll(props);

        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        rows.add(row);
        BatchValidationException errors = new BatchValidationException();
        ti.getUpdateService().insertRows(getUser(), getContainer(), rows, errors, getExtraContext());
    }

    public void createDemographicsRecord(String id, Map<String, Object> props) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException
    {
        if (id == null)
            return;

        AnimalRecord ar = DemographicsCache.get().getAnimal(getContainer(), getUser(), id);
        if (ar != null && ar.getProps().size() > 0)
        {
            _log.info("Id already exists, no need to create demographics record: " + id);
            return;
        }

        TableInfo ti = getTableInfo("study", "demographics");
        Map<String, Object> row = new CaseInsensitiveHashMap<Object>();
        row.putAll(props);
        EHRQCState qc = getQCStateForLabel("Completed");
        if (qc != null)
            row.put("qcstate", qc.getRowId());

        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        rows.add(row);
        BatchValidationException errors = new BatchValidationException();
        ti.getUpdateService().insertRows(getUser(), getContainer(), rows, errors, getExtraContext());
        DemographicsCache.get().uncacheRecords(getContainer(), id);
    }

    public Map<String, Object> getExtraContext()
    {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("quickValidation", true);
        map.put("generatedByServer", true);

        return map;
    }

    public Long findExistingAnimalsInCage(String id, String room, String cage)
    {
        if (id == null || room == null || cage == null)
            return null;

        TableInfo ti = getTableInfo("study", "housing");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id, CompareType.NEQ);
        filter.addCondition(FieldKey.fromString("room"), room, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("cage"), cage, CompareType.EQUAL);

        TableSelector ts = new TableSelector(ti, Collections.singleton("Id"), filter, null);

        return ts.getRowCount();
    }

    public String getCalculatedStatusValue(String id)
    {
        if (id == null)
            return null;

        AnimalRecord ar = DemographicsCache.get().getAnimal(getContainer(), getUser(), id);
        if (ar == null)
            return "Unknown";

        if (ar.getCalculatedStatus() != null)
            return ar.getCalculatedStatus();

        if (ar.getDeath() != null && ar.getMostRecentDeparture() != null)
        {
            return ar.getMostRecentDeparture().before(ar.getDeath()) ? "Shipped" : "Dead";
        }

        if (ar.getDeath() != null)
            return "Dead";

        if (ar.getMostRecentDeparture() != null)
            return "Shipped";

        if (ar.getCurrentRoom() != null)
            return "Alive";

        return null;
    }

    public void createRequestsForBloodAdditionalServices(String id, Integer project, String performedby, String services) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException
    {
        if (id == null || project == null)
            return;

        String[] toAutomaticallyCreate = getAdditionalServicesToCreate(services);
        if (toAutomaticallyCreate == null || toAutomaticallyCreate.length == 0)
            return;

        for (String testId : toAutomaticallyCreate)
        {
            GUID requestId = new GUID();
            Date dateRequested = new Date();
            Map<String, Object> row = new CaseInsensitiveHashMap<Object>();
            row.put("daterequested", dateRequested);
            row.put("requestid", requestId.toString());
            row.put("priority", "Routine");
            row.put("formtype", "labworkRequest");
            row.put("title", "Labwork Request From Blood Draw: " + testId);
            row.put("notify1", getUser().getUserId());

            TableInfo requests = getTableInfo("ehr", "requests");
            List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
            rows.add(row);
            requests.getUpdateService().insertRows(getUser(), getContainer(), rows, new BatchValidationException(), getExtraContext());

            TableInfo clinpathRuns = getTableInfo("study", "Clinpath Runs");
            List<Map<String, Object>> clinpathRows = new ArrayList<Map<String, Object>>();
            Map<String, Object> clinpathRow = new CaseInsensitiveHashMap<Object>();
            clinpathRow.put("Id", id);
            clinpathRow.put("date", dateRequested);
            clinpathRow.put("project", project);
            clinpathRow.put("requestId", requestId);
            clinpathRow.put("sampletype", "Blood - EDTA Whole Blood");
            clinpathRow.put("collectedBy", performedby);
            clinpathRow.put("servicerequested", testId);
            clinpathRow.put("QCStateLabel", "Request: Pending");

            clinpathRows.add(clinpathRow);
            clinpathRuns.getUpdateService().insertRows(getUser(), getContainer(), clinpathRows, new BatchValidationException(), getExtraContext());
        }
    }

    public String[] validateBloodAdditionalServices(String services, String tubeType, Double quantity)
    {
        services = StringUtils.trimToNull(services);
        if (services == null)
            return null;

        List<String> testNames = Arrays.asList(StringUtils.split(services, ","));
        if (testNames.size() == 0)
            return null;

        Map<String, Map<String, Object>> serviceMap = getBloodDrawServicesMap();
        Set<String> msgs = new HashSet<String>();

        Double accumulatedMinVol = 0.0;
        for (String testName : testNames)
        {
            Map<String, Object> map = serviceMap.get(testName);
            if (map == null)
            {
                msgs.add("Unknown service: " + testName);
                continue;
            }

            if (map.containsKey("requiredtubetype"))
            {
                String requiredType = (String)map.get("requiredtubetype");
                if (requiredType != null && !requiredType.equalsIgnoreCase(tubeType))
                {
                    msgs.add(testName + " requires a tube type of: " + requiredType);
                }
            }

            if (map.containsKey("minvolume"))
            {
                Double minVolume = (Double)map.get("minvolume");
                if (minVolume != null && minVolume > 0)
                {
                    accumulatedMinVol += minVolume;
                    if (quantity < minVolume)
                    {
                        msgs.add("Quantity below volume required for " + testName + ": " + minVolume);
                        continue;
                    }
                }
            }

            if (accumulatedMinVol > 0 && quantity < accumulatedMinVol)
            {
                msgs.add("Quantity below total volume required for services: " + accumulatedMinVol);
            }
        }

        if (msgs.size() == 0)
        {
            return null;
        }
        else
        {
            return msgs.toArray(new String[msgs.size()]);
        }
    }

    private Map<String, Map<String, Object>> getBloodDrawServicesMap()
    {
        if (_bloodDrawServices != null)
            return _bloodDrawServices;

        TableInfo ti = getTableInfo("ehr_lookups", "blood_draw_services");
        Map<String, Map<String, Object>> map = new HashMap<String, Map<String, Object>>();

        TableSelector ts = new TableSelector(ti);
        for (Map<String, Object> row : ts.getMapArray())
        {
            map.put((String)row.get("service"), row);
        }

        _bloodDrawServices = map;

        return map;
    }

    public boolean isDefaultProject(Integer project)
    {
        if (project == null)
            return false;

        return getDefaultProjects().contains(project);
    }

    private Set<Integer> _defaultProjects = null;

    public Set<Integer> getDefaultProjects()
    {
        if (_defaultProjects != null)
            return _defaultProjects;

        TableInfo ti = getTableInfo("ehr", "project");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("alwaysavailable"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("enddateCoalesced"), new Date(), CompareType.DATE_GTE);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("project"), filter, null);
        Set<Integer> ret = new HashSet<Integer>();
        ret.addAll(Arrays.asList(ts.getArray(Integer.class)));
        _defaultProjects = Collections.unmodifiableSet(ret);

        return _defaultProjects;
    }

    private String[] getAdditionalServicesToCreate(String services)
    {
        services = StringUtils.trimToNull(services);
        if (services == null)
            return null;

        List<String> testNames = Arrays.asList(StringUtils.split(services, ","));
        if (testNames.size() == 0)
            return null;

        TableInfo ti = getTableInfo("ehr_lookups", "blood_draw_services");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("service"), testNames, CompareType.IN);
        filter.addCondition(FieldKey.fromString("automaticrequestfromblooddraw"), true);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("service"), filter, null);

        return ts.getArray(String.class);
    }

    //NOTE: the interval start/stop are inclusive
    private Double getOtherDrawsQuantity(String id, Date intervalStart, Date intervalStop, List<Map<String, Object>> recordsInTransaction, String rowObjectId, Double rowQuantity)
    {
        intervalStart = DateUtils.round(intervalStart, Calendar.DATE);
        intervalStop = DateUtils.round(intervalStop, Calendar.DATE);

        //if provided, we inspect the other records in this transaction and add their values
        //first determine which other records from this transction should be considered
        Set<String> ignoredObjectIds = new HashSet<String>();
        double quantityInTransaction = 0.0;

        if (recordsInTransaction != null)
        {
            for (Map<String, Object> origMap : recordsInTransaction)
            {
                Map<String, Object> map = new CaseInsensitiveHashMap<Object>(origMap);
                if (!map.containsKey("date"))
                {
                    _log.warn("TriggerScriptHelper.verifyBloodVolume was passed a previous record lacking a date");
                    continue;
                }

                //NOTE: it would be useful to consider QCState, but we need to include pending requests in the current transaction, which this would exclude
//                EHRQCState qc = null;
//                if (map.containsKey("QCState"))
//                {
//                    Integer i = ConvertHelper.convert(map.get("QCState"), Integer.class);
//                    qc = getQCStateForRowId(i);
//                }
//                else if (map.containsKey("QCStateLabel"))
//                {
//                    qc = getQCStateForLabel((String)map.get("QCStateLabel"));
//                }
//
//                if (qc != null && (!qc.isPublicData() && !qc.isDraftData()))
//                {
//                    _log.info("skipping blood row due to QCState");
//                    continue;
//                }

                try
                {
                    Date d = ConvertHelper.convert(map.get("date"), Date.class);
                    d = DateUtils.round(d, Calendar.DATE);
                    if (d.getTime() >= intervalStart.getTime() && d.getTime() <= intervalStop.getTime())
                    {
                        Double quantity = ConvertHelper.convert(map.get("quantity"), Double.class);
                        if (quantity != null)
                            quantityInTransaction += quantity;
                    }

                    String objectId = ConvertHelper.convert(map.get("objectid"), String.class);
                    if (objectId != null)
                    {
                        ignoredObjectIds.add(objectId);
                    }
                }
                catch (ConversionException e)
                {
                    _log.error("TriggerScriptHelper.verifyBloodVolume was unable to parse date", e);
                    continue;
                }
            }
        }
        else
        {
            quantityInTransaction = rowQuantity;
            ignoredObjectIds.add(rowObjectId);
        }

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id);
        filter.addCondition(FieldKey.fromString("date"), intervalStart, CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("date"), intervalStop, CompareType.DATE_LTE);
        filter.addCondition(FieldKey.fromString("quantity"), null, CompareType.NONBLANK);

        if (ignoredObjectIds != null && ignoredObjectIds.size() > 0)
            filter.addCondition(FieldKey.fromString("objectid"), ignoredObjectIds, CompareType.NOT_IN);

        filter.addClause(new SimpleFilter.OrClause(new CompareType.EqualsCompareClause(FieldKey.fromString("qcstate/metadata/DraftData"), CompareType.EQUAL, true), new CompareType.EqualsCompareClause(FieldKey.fromString("qcstate/publicdata"), CompareType.EQUAL, true)));

        TableInfo ti = getTableInfo("study", "Blood Draws");
        TableSelector ts = new TableSelector(ti, Collections.singleton("quantity"), filter, null);

        for (Double q : ts.getArray(Double.class))
        {
            quantityInTransaction += q;
        }

        return quantityInTransaction;
    }

    private Double extractWeightForId(String id, List<Map<String, Object>> weightsInTransaction)
    {
        if (weightsInTransaction == null)
            return null;

        Double weight = null;
        Date lastDate = null;

        for (Map<String, Object> origMap : weightsInTransaction)
        {
            Map<String, Object> map = new CaseInsensitiveHashMap<Object>(origMap);
            if (!map.containsKey("date"))
            {
                _log.warn("TriggerScriptHelper.extractWeightForId was passed a previous record lacking a date");
                continue;
            }

            try
            {
                Date d = ConvertHelper.convert(map.get("date"), Date.class);
                if (d == null)
                    continue;

                if (lastDate == null || d.after(lastDate))
                {
                    Double w = ConvertHelper.convert(map.get("weight"), Double.class);
                    if (w != null)
                    {
                        lastDate = d;
                        weight = w;
                    }
                }
            }
            catch (ConversionException e)
            {
                _log.error("TriggerScriptHelper.extractWeightForId was unable to parse date", e);
                continue;
            }
        }

        return weight;
    }

    public String verifyBloodVolume(String id, Date date, List<Map<String, Object>> recordsInTransaction, List<Map<String, Object>> weightsInTransaction, String objectId, Double quantity)
    {
        if (id == null || date == null || quantity == null)
            return null;

        AnimalRecord ar = DemographicsCache.get().getAnimal(getContainer(), getUser(), id);
        if (ar == null)
            return null;

        String species = ar.getSpecies();
        if (species == null)
            return "Unknown species, unable to calculate allowable blood volume";

        Double weight = extractWeightForId(id, weightsInTransaction);
        if (weight == null)
            weight = ar.getMostRecentWeight();

        if (weight == null)
            return "Unknown weight, unable to calculate allowable blood volume";

        TableSelector allowable = new TableSelector(getTableInfo("ehr_lookups", "species"), Table.ALL_COLUMNS, new SimpleFilter(FieldKey.fromString("common"), species), null);
        Map<String, Object>[] rows = allowable.getMapArray();
        if (rows.length != 1)
            return "Unable to calculate allowable blood volume";

        Double bloodPerKg = (Double)rows[0].get("blood_per_kg");
        Integer interval = ((Double)rows[0].get("blood_draw_interval")).intValue();
        Double maxDrawPct = (Double)rows[0].get("max_draw_pct");
        if (bloodPerKg == null || interval == null || maxDrawPct == null)
            return "Unable to calculate allowable blood volume";

        Double maxAllowable = Math.round((weight * bloodPerKg * maxDrawPct) * 100) / 100.0;

        //find draws over the interval
        Calendar intervalMin = Calendar.getInstance();
        intervalMin.setTime(date);
        intervalMin.add(Calendar.DATE, (-1 * interval) + 1);  //draws drop off on the morning of the nth date

        Double bloodPrevious = getOtherDrawsQuantity(id, intervalMin.getTime(), date, recordsInTransaction, objectId, quantity);
        if (bloodPrevious == null)
            bloodPrevious = 0.0;

        if (bloodPrevious > maxAllowable)
        {
            return "Blood volume of " + quantity + " (" + bloodPrevious + " total) exceeds allowable volume of " + maxAllowable + "' mL over the previous " + interval + " days (" + weight + " kg)";
        }

        // if we didnt already have an error, check the future interval
        Calendar intervalMax = Calendar.getInstance();
        intervalMax.setTime(date);
        intervalMax.add(Calendar.DATE, interval);

        Double bloodFuture = getOtherDrawsQuantity(id, date, intervalMax.getTime(), recordsInTransaction, objectId, quantity);
        if (bloodFuture == null)
            bloodFuture = 0.0;

        if (bloodFuture > maxAllowable)
        {
            return "Blood volume of " + bloodFuture + " conflicts with future draws. Max allowable is : " + maxAllowable + " mL (" + weight + " kg)";
        }

        return null;
    }

    public void processDeniedRequests(final List<String> requestIds)
    {
        JobRunner.getDefault().execute(new Runnable(){
            public void run()
            {
                _log.info("processing denied request email for " + requestIds.size() + " records");

                TableInfo ti = getTableInfo("ehr", "requests");
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("requestid"), requestIds, CompareType.IN);
                TableSelector ts = new TableSelector(ti, Table.ALL_COLUMNS, filter, null);

                ts.forEach(new Selector.ForEachBlock<ResultSet>()
                {
                    @Override
                    public void exec(ResultSet rs) throws SQLException
                    {
                        String requestid = rs.getString("requestid");
                        Integer notify1 = rs.getInt("notify1");
                        Integer notify2 = rs.getInt("notify2");
                        Integer notify3 = rs.getInt("notify3");
                        boolean sendemail = rs.getObject("sendemail") == null ? false : rs.getBoolean("sendemail");
                        String title = rs.getString("title");
                        String formtype = rs.getString("formtype");

                        if (sendemail)
                        {
                            String subject = "EHR " + formtype + " Cancelled/Denied";
                            Set<User> recipients = getRecipients(notify1, notify2, notify3);
                            if (recipients.size() == 0)
                            {
                                _log.warn("No recipients, unable to send EHR trigger script email");
                                return;
                            }

                            StringBuilder html = new StringBuilder();

                            html.append("One or more records from the request titled " + title + " have been cancelled or denied.  ");
                            html.append("<a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + getContainer().getPath() + "/dataEntryFormDetails.view?requestId=" + requestid + "&formType=" + formtype + "'>");
                            html.append("Click here to view them</a>.  <p>");

                            sendMessage(subject, html.toString(), recipients);
                        }
                    }
                });

                //TODO: figure out whether to mark whole request as denied
            }
        });
    }

    public void processCompletedRequests(final List<String> requestIds) throws Exception
    {
        JobRunner.getDefault().execute(new Runnable(){
            public void run()
            {
                _log.info("processing completed request email for " + requestIds.size() + " records");

                TableInfo ti = getTableInfo("ehr", "requests");
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("requestid"), requestIds, CompareType.IN);
                TableSelector ts = new TableSelector(ti, Table.ALL_COLUMNS, filter, null);

                ts.forEach(new Selector.ForEachBlock<ResultSet>()
                {
                    @Override
                    public void exec(ResultSet rs) throws SQLException
                    {
                        String requestid = rs.getString("requestid");
                        Integer notify1 = rs.getInt("notify1");
                        Integer notify2 = rs.getInt("notify2");
                        Integer notify3 = rs.getInt("notify3");
                        boolean sendemail = rs.getObject("sendemail") == null ? false : rs.getBoolean("sendemail");
                        String title = rs.getString("title");
                        String formtype = rs.getString("formtype");

                        if (sendemail)
                        {
                            String subject = "EHR " + formtype + " Completed";
                            Set<User> recipients = getRecipients(notify1, notify2, notify3);
                            if (recipients.size() == 0)
                            {
                                _log.warn("No recipients, unable to send EHR trigger script email");
                                return;
                            }

                            StringBuilder html = new StringBuilder();

                            html.append("One or more records from the request titled " + title + " have been marked completed.  ");
                            html.append("<a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + getContainer().getPath() + "/dataEntryFormDetails.view?requestId=" + requestid + "&formType=" + formtype + "'>");
                            html.append("Click here to view them</a>.  <p>");

                            sendMessage(subject, html.toString(), recipients);
                        }
                    }
                });

                //TODO: figure out whether to mark whole request as completed
            }
        });
    }

    private Set<User> getRecipients(Integer... userIds)
    {
        Set<User> recipients = new HashSet<>();
        for (Integer userId : userIds)
        {
            if (userId > 0)
            {
                UserPrincipal up = SecurityManager.getPrincipal(userId);
                if (up != null)
                {
                    if (up instanceof  User)
                    {
                        recipients.add((User)up);
                    }
                    else
                    {
                        for (UserPrincipal u : SecurityManager.getAllGroupMembers((Group)up, MemberType.ACTIVE_USERS))
                        {
                            if (((User)u).isActive())
                                recipients.add((User)u);
                        }
                    }
                }
            }
        }

        return recipients;
    }

    public void onAnimalArrival(String id, Map<String, Object> row) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException
    {
        Map<String, Object> demographicsProps = new HashMap<String, Object>();
        for (String key : new String[]{"Id", "gender", "species", "dam", "sire", "origin", "source", "geographic_origin", "geographic_origin", "birth"})
        {
            if (row.containsKey(key))
            {
                demographicsProps.put(key, row.get(key));
            }
        }
        demographicsProps.put("date", row.get("birth"));
        demographicsProps.put("calculated_status", "Alive");
        createDemographicsRecord(id, demographicsProps);

        if (row.containsKey("birth"))
        {
            Map<String, Object> birthProps = new HashMap<String, Object>();
            for (String key : new String[]{"Id", "dam", "sire"})
            {
                if (row.containsKey(key))
                {
                    birthProps.put(key, row.get(key));
                }
            }
            birthProps.put("date", row.get("birth"));

            createBirthRecord(id, birthProps);
        }
    }

    private Date findMostRecentDate(String id, Date lastVal, Map<String, List<Date>> otherVals)
    {
        if (otherVals != null && otherVals.containsKey(id))
        {
            for (Object obj : otherVals.get(id))
            {
                try
                {
                    Date d = ConvertHelper.convert(obj, Date.class);
                    if (d != null && (lastVal == null || d.after(lastVal)))
                    {
                        lastVal = d;
                    }
                }
                catch (ConversionException e)
                {
                    _log.warn("Improper date: " + obj, e);
                }
            }
        }

        return lastVal;
    }

    public Set<String> hasDemographicsRecord(List<String> ids)
    {
        TableInfo ti = getTableInfo("study", "Demographics");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), new HashSet<String>(ids), CompareType.IN);
        filter.addCondition(FieldKey.fromString("qcstate/publicdata"), true);

        TableSelector ts = new TableSelector(ti, Collections.singleton("Id"), filter, null);

        Set<String> ret = new HashSet<String>();
        ret.addAll(Arrays.asList(ts.getArray(String.class)));

        return ret;
    }

    public void updateStatusField(List<String> ids, Map<String, List<Date>> births, Map<String, List<Date>> arrivals, Map<String, List<Date>> deaths, Map<String, List<Date>> departures) throws QueryUpdateServiceException, DuplicateKeyException, SQLException, BatchValidationException, InvalidKeyException
    {
        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();

        Set<String> idsInDemographics = hasDemographicsRecord(ids);
        for (String id : ids)
        {
            if (!idsInDemographics.contains(id))
            {
                _log.info("ID not in demographics table, cannot update status: " + id);
                continue;
            }

            Date lastArrival = findMostRecentDate(id, getMostRecentDate(id, "Arrival"), arrivals);
            Date lastBirth = findMostRecentDate(id, getMostRecentDate(id, "Birth"), births);
            Date lastDeath = findMostRecentDate(id, getMostRecentDate(id, "Deaths"), deaths);
            Date lastDeparture = findMostRecentDate(id, getMostRecentDate(id, "Departure"), departures);

            String status = null;
            if (lastDeath != null)
            {
                status = "Dead";
            }
            else if (lastDeparture != null)
            {
                if (lastArrival != null && lastArrival.after(lastDeparture))
                {
                    status = "Alive";
                }
                else
                {
                    status = "Shipped";
                }
            }
            else if (lastBirth != null || lastArrival != null)
            {
                status = "Alive";
            }
            else
            {
                status = "Unknown";
            }

            Map<String, Object> row = new CaseInsensitiveHashMap<Object>();
            row.put("Id", id);
            row.put("calculated_status", status);

            rows.add(row);
        }

        //now perform the actual update
        TableInfo ti = getTableInfo("study", "Demographics");
        ti.getUpdateService().updateRows(getUser(), getContainer(), rows, rows, getExtraContext());
        DemographicsCache.get().uncacheRecords(getContainer(), ids);
    }

    //find most recent record date for the passed Id/table
    private Date getMostRecentDate(String id, String queryName)
    {
        TableInfo ti = getTableInfo("study", queryName);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id);
        filter.addCondition(FieldKey.fromString("qcstate/publicdata"), true);

        TableSelector ts = new TableSelector(ti, Collections.singleton("date"), filter, null);
        Map<String, List<Aggregate.Result>> aggs = ts.getAggregates(Collections.singletonList(new Aggregate(FieldKey.fromString("date"), Aggregate.Type.MAX)));
        for (List<Aggregate.Result> ag : aggs.values())
        {
            for (Aggregate.Result r : ag)
            {
                if (r.getValue() instanceof Date)
                {
                    return (Date)r.getValue();
                }
            }
        }

        return null;
    }

    //we want to catch situations where we insert an opened-ended housing record
    //when there is already another opened ended record with a later date.
    //if we inserted an open ended record and there is a pre-existing one with an earlier start date, this is ok since the latter will be closed out
    private Integer getOpenEndedHousingOverlaps(String id, Date date, Date enddate, List<Map<String, Object>> recordsInTransaction, String rowObjectId)
    {
        //if provided, we inspect the other records in this transaction and add their values
        //first determine which other records from this transction should be considered
        Set<String> ignoredObjectIds = new HashSet<String>();
        int otherOpenEndedRecords = 0;

        if (recordsInTransaction != null)
        {
            for (Map<String, Object> origMap : recordsInTransaction)
            {
                Map<String, Object> map = new CaseInsensitiveHashMap<Object>(origMap);
                if (!map.containsKey("date"))
                {
                    _log.warn("TriggerScriptHelper.hasHousingOverlaps was passed a previous record lacking a date");
                    continue;
                }

                EHRQCState qc = null;
                if (map.containsKey("QCState"))
                {
                    Integer i = ConvertHelper.convert(map.get("QCState"), Integer.class);
                    qc = getQCStateForRowId(i);
                }
                else if (map.containsKey("QCStateLabel"))
                {
                    qc = getQCStateForLabel((String)map.get("QCStateLabel"));
                }

                if (qc == null || (!qc.isPublicData()))
                {
                    _log.info("skipping blood row due to QCState");
                    continue;
                }

                try
                {
                    Date now = new Date();
                    Date start = ConvertHelper.convert(map.get("date"), Date.class);
                    Date end = ConvertHelper.convert(map.get("enddate"), Date.class);

                    String objectId = ConvertHelper.convert(map.get("objectid"), String.class);
                    if (objectId != null)
                    {
                        ignoredObjectIds.add(objectId);
                    }

                    // if the record has ended in the past, we ignore it.
                    // we dont worry about catching overlapping records here, although perhaps we should
                    if (end != null && end.getTime() < now.getTime())
                        continue;

                    if (start.getTime() >= date.getTime())
                    {
                        otherOpenEndedRecords++;
                    }
                }
                catch (ConversionException e)
                {
                    _log.error("TriggerScriptHelper.verifyBloodVolume was unable to parse date", e);
                    continue;
                }
            }
        }
        else
        {
            ignoredObjectIds.add(rowObjectId);
        }

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id);
        filter.addCondition(FieldKey.fromString("date"), date, CompareType.LTE);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);

        if (ignoredObjectIds != null && ignoredObjectIds.size() > 0)
            filter.addCondition(FieldKey.fromString("objectid"), ignoredObjectIds, CompareType.NOT_IN);

        filter.addCondition(FieldKey.fromString("qcstate/publicData"), true, CompareType.EQUAL);

        TableInfo ti = getTableInfo("study", "Housing");
        TableSelector ts = new TableSelector(ti, Collections.singleton("Id"), filter, null);
        otherOpenEndedRecords += ts.getRowCount();

        return otherOpenEndedRecords;
    }

    public String onHousingBecomePublic(String id, Date date, Date enddate, String objectid, List<Map<String, Object>> recordsInTransaction)
    {
        if (id == null || date == null || enddate != null)
            return null;


        Integer overlapping = getOpenEndedHousingOverlaps(id, date, enddate, recordsInTransaction, objectid);
        if (overlapping > 0)
            return "You cannot enter an open ended housing while there is another active record starting after this record's start date";

        return null;
    }

    private void sendMessage(String subject, String bodyHtml, Set<User> recipients)
    {
        try
        {
            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
            msg.setFrom(NotificationService.get().getReturnEmail(getContainer()));
            msg.setSubject(subject);

            List<String> emails = new ArrayList<>();
            for (User u : recipients)
            {
                if (u.getEmail() != null)
                    emails.add(u.getEmail());
            }

            if (emails.size() == 0)
            {
                _log.warn("No emails, unable to send EHR trigger script email");
                return;
            }

            msg.setRecipients(Message.RecipientType.TO, StringUtils.join(emails, ","));
            msg.setBodyContent(bodyHtml, "text/html");

            MailHelper.send(msg, getUser(), getContainer());
        }
        catch (Exception e)
        {
            _log.error("Unable to send email from EHR trigger script", e);
        }
    }

    //TODO
    private void sendDeathNotification(final String idString)
    {
        JobRunner.getDefault().execute(new Runnable(){
            public void run()
            {
                final User user = getUser();
                final Container container = getContainer();
                String[] ids = idString.split(";");


            }
        });
    }

    //TODO
    public void verifyAssignmentCounts(String id, Integer protocol)
    {
//        LABKEY.Query.selectRows({
//                schemaName: 'ehr',
//            queryName: 'protocolTotalAnimalsBySpecies',
//            viewName: 'With Animals',
//            scope: this,
//            filterArray: [
//        LABKEY.Filter.create('species', species+';All Species', LABKEY.Filter.Types.EQUALS_ONE_OF),
//                LABKEY.Filter.create('protocol', protocol, LABKEY.Filter.Types.EQUAL)
//        ],
//        success: function(data){
//        if (data && data.rows && data.rows.length){
//            for(var i=0;i<data.rows.length;i++){
//                var remaining = data.rows[i].TotalRemaining;
//                var species = data.rows[i].Species;
//
//                if (!context.extraContext.newIdsAdded[protocol][species])
//                    context.extraContext.newIdsAdded[protocol][species] = [];
//
//                if (context.extraContext.newIdsAdded[protocol] && context.extraContext.newIdsAdded[protocol][species]){
//                    remaining -= context.extraContext.newIdsAdded[protocol][species].length;
//                }
//
//                var animals = data.rows[i].Animals;
//                if (animals && animals.indexOf(row.Id)==-1){
//                    if (remaining <= 1)
//                        EHR.Server.Utils.addError(scriptErrors, 'project', 'There are not enough spaces on protocol: '+protocol, 'WARN');
//
//                    if (context.extraContext.newIdsAdded[protocol][species] && context.extraContext.newIdsAdded[protocol][species].indexOf(row.Id)==-1)
//                        context.extraContext.newIdsAdded[protocol][species].push(row.Id);
//                }
//            }
//        }
//        else {
//            console.log('there was an error finding allowable animals per assignment')
//        }
//    },
//        failure: EHR.Server.Utils.onFailure
//        });

    }
}
