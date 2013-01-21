/*
 * Copyright (c) 2012 LabKey Corporation
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

import org.apache.log4j.Logger;
import org.json.JSONArray;
import org.labkey.api.cache.CacheManager;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlExecutor;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.JobRunner;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.ehr.EHRManager;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 3/1/12
 * Time: 7:23 AM
 */
public class TriggerScriptHelper
{
    private static String QCSTATE_CACHE_ID = "qcstates";

    private String _containerId;
    private int _userId;

    private static Logger _log = Logger.getLogger(TriggerScriptHelper.class);

    private TriggerScriptHelper(int userId, String containerId)
    {
        User user = UserManager.getUser(userId);
        if (user == null)
            throw new RuntimeException("User does not exist: " + userId);
        _userId = userId;

        Container container = ContainerManager.getForId(containerId);
        if (container == null)
            throw new RuntimeException("Container does not exist: " + containerId);
        _containerId = containerId;

        Study study = getStudy();
        if (study == null)
            throw new RuntimeException("No study found in container: " + containerId);
    }

    private User getUser()
    {
        return UserManager.getUser(_userId);
    }

    private Container getContainer()
    {
        return ContainerManager.getForId(_containerId);
    }

    private Study getStudy()
    {
        return StudyService.get().getStudy(getContainer());
    }

    private static String getCacheKey(int userId, String containerId)
    {
        return TriggerScriptHelper.class.getName() + "|" + containerId + "|" + userId;
    }

    public static TriggerScriptHelper getForContainer(int userId, String containerId)
    {
        String key = getCacheKey(userId, containerId);
        TriggerScriptHelper helper = (TriggerScriptHelper)CacheManager.getSharedCache().get(key);
        if (helper != null)
        {
            return helper;
        }

        _log.info("Creating triger script helper for: " +  userId + ", " + containerId);
        helper = new TriggerScriptHelper(userId, containerId);
        CacheManager.getSharedCache().put(key, helper);
        return helper;
    }

    public static boolean closeActiveDatasetRecords(String c, int userId, List<String> queryNames, String id, Date enddate)
    {
        boolean success = false;

        Container container = ContainerManager.getForId(c);
        if(container == null)
        {
            //these should not be RuntimeExceptions...
            throw new RuntimeException("Non existent container: " + c);
        }

        User user = (User)SecurityManager.getPrincipal(userId);
        if(user == null)
        {
            throw new RuntimeException("Non existent user: " + userId);
        }

        StudyService.Service ss = StudyService.get();
        Study study = ss.getStudy(container);
        if (study == null)
        {
            throw new RuntimeException("No study found in container: " + c);
        }

        for (String queryName : queryNames)
        {
            int datasetId = ss.getDatasetId(container, queryName);
            DataSet dataset = ss.getDataSet(container, datasetId);
            if(dataset == null){
                throw new RuntimeException("Non existent table: study." + queryName);
            }

            TableInfo ti = dataset.getTableInfo(user);
            SQLFragment sql = new SQLFragment("UPDATE " + ti.getSchema().getName() + "." + ti.getSelectName() + " SET enddate = ? WHERE id = ? AND enddate IS NULL", enddate, id);
            new SqlExecutor(ti.getSchema()).execute(sql);
        }
        return success;
    }

    public static List<String> getScriptsToLoad(String containerId)
    {
        Container c = ContainerManager.getForId(containerId);

        List<String> scripts = new ArrayList<String>();
        for (Resource script : EHRService.get().getExtraTriggerScripts(c))
        {
            scripts.add(script.getPath().toString());
        }

        return Collections.unmodifiableList(scripts);
    }

    public boolean hasPermission(String schemaName, String queryName, String eventName, String originalQCState, String targetQCState)
    {
        EVENT_TYPE event = EVENT_TYPE.valueOf(eventName);
        Map<String, EHRQCState> qcStates = getQCStateInfo();

        SecurableResource sr = getSecurableResource(schemaName, queryName);
        EHRQCState targetQC = qcStates.get(targetQCState);
        if (targetQC == null)
            return false;
        EHRQCState originalQC = null;
        if (originalQCState != null)
        {
            originalQC = qcStates.get(originalQCState);
            if (originalQC == null)
                return false;
        }

        //NOTE: currently we only test per-table permissions on study
        if (sr == null)
            return true;

        if (event.equals(EVENT_TYPE.update))
        {
            //test update on oldQC, plus insert on new QC
            if (originalQCState != null)
            {
                if (!testPermission(sr, UpdatePermission.class, originalQC))
                    return false;
            }

            //we only need to test insert if the new QCState is different from the old one
            if (!targetQCState.equals(originalQCState))
            {
                if (!testPermission(sr, InsertPermission.class, targetQC))
                    return false;
            }
        }
        else
        {
            if (!testPermission(sr, event.perm, targetQC))
                return false;
        }

        return true;
    }

    public String getQCStateJson() throws Exception
    {
        try
        {
            Map<String, EHRQCState> qcStates = getQCStateInfo();

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

    public EHRQCState getQCStateForRowId(int rowId) throws Exception
    {
        try
        {
            Map<String, EHRQCState> qcStates = getQCStateInfo();

            for (EHRQCState qc : qcStates.values())
            {
                if (qc.getRowId() == rowId)
                    return qc;

            }
            return null;
        }
        catch (Exception e)
        {
            //NOTE: this is only called by JS triggers, which will bury the exception otherwise
            _log.error(e.getMessage());
            _log.error(e.getStackTrace());
            throw(e);
        }
    }

    public EHRQCState getQCStateForLabel(String label) throws Exception
    {
        try
        {
            Map<String, EHRQCState> qcStates = getQCStateInfo();

            if (qcStates.containsKey(label))
                return qcStates.get(label);
            else
                return null;
        }
        catch (Exception e)
        {
            //NOTE: this is only called by JS triggers, which will bury the exception otherwise
            _log.error(e.getMessage());
            _log.error(e.getStackTrace());
            throw(e);
        }
    }

    private boolean testPermission (SecurableResource resource, Class<? extends Permission> perm, EHRQCState qcState)
    {
        Collection<Class<? extends Permission>> permissions;
        String className = getPermissionClassName(perm, qcState);

        //NOTE: See getResourceProps() in SecurityApiActions for notes on this hack
        if (resource instanceof DataSet)
        {
            DataSet ds = (DataSet)resource;
            permissions = ds.getPermissions(getUser());
        }
        else
        {
            SecurityPolicy policy = SecurityPolicyManager.getPolicy(resource);
            permissions = policy.getPermissions(getUser());
        }

        for (Class<? extends Permission> p : permissions)
        {
            if (p.getName().equals(className))
                return true;
        }

        return false;
    }

    private String getPermissionClassName(Class<? extends Permission> perm, EHRQCState qc)
    {
        //TODO: this is a little ugly
        String permString = perm.getCanonicalName().replaceAll(perm.getPackage().getName() + "\\.", "");
        String qcString = qc.getLabel().replaceAll("[^a-zA-Z0-9-]", "");
        return EHRManager.SECURITY_PACKAGE + qcString + permString;
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
            filter = new SimpleFilter(keyField, keyValue);
        }
        else
        {
            filter = new SimpleFilter();
            filter.addWhereClause(sql, new Object[]{keyValue}, FieldKey.fromParts(keyField));
        }
        Table.delete(table, filter);
    }

    private static enum EVENT_TYPE {
        insert(InsertPermission.class),
        update(UpdatePermission.class),
        delete(DeletePermission.class);

        EVENT_TYPE(Class<? extends Permission> perm)
        {
            this.perm = perm;
        }

        public Class<? extends Permission> perm;
    }

    private SecurableResource getSecurableResource(String schemaName, String queryName)
    {
        if ("study".equalsIgnoreCase(schemaName))
        {
            for (SecurableResource sr : getStudy().getChildResources(getUser()))
            {
                if (sr.getResourceName().equals(queryName))
                {
                    return sr;
                }
            }
        }
        return null;
    }

//    private void sendMessage()
//    {
//        //to send email: see SendMessageAction implementation
//        //MailHelper will send the email, but you loose some of the benefit of our API, like auto-resolving emails from UserIds.
//        //it would be preferable to use this and i need to look in more detail
//        try
//        {
//            MailHelper.MultipartMessage msg = MailHelper.createMultipartMessage();
//            msg.setBodyContent("Hello", "Hello");
//        }
//        catch (Exception e)
//        {
//            //do something
//        }
//    }

    private Map<String, EHRQCState> getQCStateInfo()
    {
        String cacheKey = getCacheKey(getStudy(), QCSTATE_CACHE_ID);
        Map<String, EHRQCState> qcStates = (Map<String, EHRQCState>)CacheManager.getSharedCache().get(cacheKey);
        if (qcStates != null)
            return qcStates;

        try
        {
            qcStates = new HashMap<String, EHRQCState>();
            SQLFragment sql = new SQLFragment("SELECT * FROM study.qcstate qc LEFT JOIN ehr.qcstatemetadata md ON (qc.label = md.QCStateLabel) WHERE qc.container = ?", getContainer().getEntityId());
            DbSchema db = DbSchema.get("study");
            EHRQCState[] qcs = Table.executeQuery(db, sql, EHRQCState.class);
            for (EHRQCState qc : qcs)
            {
                qcStates.put(qc.getLabel(), qc);
            }

            CacheManager.getSharedCache().put(getCacheKey(getStudy(), QCSTATE_CACHE_ID), qcStates);
            return qcStates;
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
    }

    private FormContext getFormContext(String formName)
    {
        //TODO: caching

        return new FormContext(formName);
    }

    private String getCacheKey(Study s, String suffix)
    {
        return getClass().getName() + "||" + s.getEntityId() + "||" + suffix;
    }

    private void sendDeathNotification(String idString)
    {
        final User user = getUser();
        final Container container = getContainer();
        String[] ids = idString.split(";");

        JobRunner.getDefault().execute(new Runnable(){
            public void run()
            {


            }
        });
    }
}
