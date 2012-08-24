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

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.view.UnauthorizedException;

import java.sql.SQLException;
import java.util.Date;
import java.util.List;


/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 3/1/12
 * Time: 7:23 AM
 */
public class TriggerScriptHelper
{
    private TriggerScriptHelper _instance =  new TriggerScriptHelper();

    private TriggerScriptHelper()
    {

    }

    public TriggerScriptHelper getInstance()
    {
        return _instance;
    }

    public static boolean closeActiveDatasetRecords(String c, int userId, List<String> queryNames, List<String> ids, Date enddate)
    {
        boolean success = false;

        if(ids == null || ids.size() == 0)
        {
            return false;
        }

        Container container = ContainerManager.getForId(c);
        if(container == null)
        {
            //these should not be RuntimeExceptions...
            throw new RuntimeException("Non existent container: " + c);
        }

        User user = (User)org.labkey.api.security.SecurityManager.getPrincipal(userId);
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

            try
            {
                TableInfo ti = dataset.getTableInfo(user);
                SQLFragment sql = new SQLFragment("UPDATE " + ti.getSchema().getName() + "." + ti.getSelectName() + " SET enddate = ? WHERE id IN (?) AND enddate IS NULL", enddate, StringUtils.join(ids, "','"));
                Table.execute(ti.getSchema(), sql);
            }
            catch (SQLException e)
            {
                throw new RuntimeSQLException(e);
            }
        }
        return success;
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

//    private static enum EVENT_TYPE {
//        insert(),
//        update(),
//        delete();
//
//        EVENT_TYPE()
//        {
//
//        }
//    }
//
//    public static boolean hasPermission(int userId, String containerId, String event, String targetQCLabel, @Nullable String originalQCLabel)
//    {
//
//
//        return true;
//    }
//
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
}
