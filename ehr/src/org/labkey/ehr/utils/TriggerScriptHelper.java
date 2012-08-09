package org.labkey.ehr.utils;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;

import java.lang.reflect.Array;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.poi.util.StringUtil;
import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.*;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.ResultSetUtil;
import org.labkey.api.view.UnauthorizedException;
import org.labkey.ehr.EHRSchema;
import org.springframework.validation.BindException;


/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 3/1/12
 * Time: 7:23 AM
 */
public class TriggerScriptHelper
{
    public TriggerScriptHelper()
    {
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

//            ResultSet rs = null;
            try
            {

//                List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
//                List<Map<String, Object>> oldRows = new ArrayList<Map<String, Object>>();
//
//                SimpleFilter filter = new SimpleFilter(FieldKey.fromString(study.getSubjectColumnName()), ids, CompareType.IN);
//                filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
//                rs = Table.select(dataset.getTableInfo(user), Collections.singleton("lsid"), filter, null);
//                Map<String, Object> row;
//                Map<String, Object> oldRow;
//                while (rs.next())
//                {
//                    row = new HashMap<String, Object>();
//                    oldRow = new HashMap<String, Object>();
//                    row.put("lsid", rs.getString("lsid"));
//                    oldRow.put("lsid", rs.getString("lsid"));
//
//                    row.put("enddate", enddate);
//                    rows.add(row);
//                    oldRows.add(row);
//                }

                //QueryUpdateService ds = dataset.getTableInfo(user).getUpdateService();
                TableInfo ti = dataset.getTableInfo(user);
                SQLFragment sql = new SQLFragment("UPDATE " + ti.getSchema().getName() + "." + ti.getSelectName() + " SET enddate = ? WHERE id IN (?) AND enddate IS NULL", enddate, StringUtils.join(ids, "','"));
                Table.execute(ti.getSchema(), sql);
            }
            catch (SQLException e)
            {
                throw new RuntimeSQLException(e);
            }
//            finally
//            {
//                ResultSetUtil.close(rs);
//            }
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
