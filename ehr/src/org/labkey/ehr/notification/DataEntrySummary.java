package org.labkey.ehr.notification;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Selector;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.notification.NotificationSection;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Study;
import org.labkey.ehr.EHRManager;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Date;
import java.util.Set;

/**
 * User: bimber
 * Date: 9/23/13
 * Time: 9:11 PM
 */
public class DataEntrySummary implements NotificationSection
{
    public DataEntrySummary()
    {

    }

    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();

        Set<Study> studies = EHRManager.get().getEhrStudies(u);
        if (studies == null || studies.size() == 0)
            return null;

        Calendar yesterday = Calendar.getInstance();
        yesterday.setTime(new Date());
        yesterday.add(Calendar.DATE, -1);

        msg.append("<b>EHR Data Entry Summary:</b><p>");

        final StringBuilder taskTable = new StringBuilder();
        taskTable.append("Tasks created yesterday:<br>");
        taskTable.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td>Folder</td><td>Form Type</td><td>Total</td></tr>");
        boolean hasTasks = false;

        for (final Study s : studies)
        {
            UserSchema us = QueryService.get().getUserSchema(u, s.getContainer(), "ehr");
            if (us == null)
                continue;

            TableInfo taskSummary = us.getTable("taskSummary");
            if (taskSummary == null)
                continue;

            TableSelector tsTasks = new TableSelector(taskSummary, new SimpleFilter(FieldKey.fromString("created"), yesterday.getTime(), CompareType.DATE_EQUAL), new Sort("-total"));
            if (tsTasks.exists())
            {
                hasTasks = true;
                tsTasks.forEach(new Selector.ForEachBlock<ResultSet>()
                {
                    @Override
                    public void exec(ResultSet rs) throws SQLException
                    {
                        taskTable.append("<tr><td>" + s.getContainer().getPath() + "</td><td>" + rs.getString("formType") + "</td><td>" + rs.getInt("total") + "</td></tr>");
                    }
                });
            }
        }

        taskTable.append("</table><p>");

        final StringBuilder requestTable  = new StringBuilder();
        requestTable.append("Requests created yesterday:<br>");
        requestTable.append("<table border=1 style='border-collapse: collapse;'><tr style='font-weight: bold;'><td>Form Type</td><td>Total</td></tr>");
        boolean hasRequests = false;

        for (final Study s : studies)
        {
            UserSchema us = QueryService.get().getUserSchema(u, s.getContainer(), "ehr");
            if (us == null)
                continue;

            TableInfo requestSummary = us.getTable("requestSummary");
            if (requestSummary == null)
                continue;

            TableSelector tsRequest = new TableSelector(requestSummary, new SimpleFilter(FieldKey.fromString("created"), yesterday.getTime(), CompareType.DATE_EQUAL), new Sort("-total"));
            if (tsRequest.exists())
            {
                hasRequests = true;
                tsRequest.forEach(new Selector.ForEachBlock<ResultSet>()
                {
                    @Override
                    public void exec(ResultSet rs) throws SQLException
                    {
                        requestTable.append("<tr><td>" + rs.getString("formType") + "</td><td>" + rs.getInt("total") + "</td></tr>");
                    }
                });
            }
        }

        requestTable.append("</table><p>");

        if (hasTasks)
        {
            msg.append(taskTable);
        }
        else
        {
            msg.append("No tasks were created yesterday<p>");
        }

        if (hasRequests)
        {
            msg.append(requestTable);
        }
        else
        {
            msg.append("No requests were created yesterday<p>");
        }

        msg.append("<hr>");

        return msg.toString();
    }

    public boolean isAvailable(Container c, User u)
    {
        return true;
    }
}
