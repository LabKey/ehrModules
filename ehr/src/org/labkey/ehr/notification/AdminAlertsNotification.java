package org.labkey.ehr.notification;

import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.util.ResultSetUtil;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.validation.BindException;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 4:02 PM
 */
public class AdminAlertsNotification extends AbstractNotification
{
    public String getName()
    {
        return "Admin Alerts";
    }

    public String getDescription()
    {
        return "This runs every day at 10AM and sends an email summarizing various events about the site, including usage";
    }

    public String getEmailSubject()
    {
        return "Daily Admin Alerts: " + _dateTimeFormat.format(new Date());
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        //TODO: 10AM
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 1, TimeUnit.DAYS));
        return tasks;
    }

    public String getScheduleDescription()
    {
        return "daily at 10AM";
    }

    public String getMessage()
    {
        StringBuilder msg = new StringBuilder();
        msg.append("This email contains a series of alerts designed for site admins.  It was run on: " + _dateTimeFormat.format(new Date()) + ".<p>");

        siteUsage(msg);
        clientErrors(msg);
        //TODO
//        dataEntryStatus(msg);

        //TODO: possibly log changes?  maybe other timestamps?

        return msg.toString();
    }

    /**
     * summarize site usage in the past 7 days
     */
    private void siteUsage(final StringBuilder msg)
    {
        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "core");
        mpv.addPropertyValue("query.queryName", "SiteUsageByDay");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "core");
        QuerySettings qs = us.getSettings(mpv, "query");
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -7);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), cal.getTime(), CompareType.DATE_GTE);
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            if (rs.next())
            {
                msg.append("Site Logins In The Past 7 Days:<br>\n");
                msg.append("<table border=1><tr><td>Day of Week</td><td>Date</td><td>Logins</td></tr>");
                do
                {
                    msg.append("<tr><td>" + rs.getString("dayOfWeek") + "</td><td>" + _dateTimeFormat.format(rs.getDate("date")) + "</td><td>" + rs.getString("Logins") + "</td></tr>");
                }
                while (rs.next());
            }
            msg.append("</table><p>\n");
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }

    /**
     * summarize client errors
     */
    private void clientErrors(final StringBuilder msg)
    {
//        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), "-7d", CompareType.DATE_GTE);
//        ['date', 'dategte', $yesterday],
//		['key1', 'neq', 'LabKey Server Backup'],
//
//        UserSchema schema = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "auditLog");
//        TableSelector ts = new TableSelector(schema.getTable("audit"), Table.ALL_COLUMNS, filter, null);
//        if (ts.getRowCount() > 0)
//        {
//        	msg.append("<b>WARNING: There were " + ts.getRowCount() + " client errors since $yesterday:</b>");
//
//            msg.append("<p><a href='" + _baseUrl + "query/Shared/executeQuery.view?schemaName=auditlog&query.queryName=audit&query.viewName=EHR Client Errors&query.date~dategte=".$yesterday."&key1~neq=LabKey Server Backup'>Click here to them</a></p>\n");
//            msg.append("<hr>");
//        }
    }

    /**
     * we print some stats on data entry
     */
    private void dataEntryStatus(final StringBuilder msg)
    {
        msg.append("<b>Data Entry Stats:</b><p>");

        Results rs = null;
        try
        {
            MutablePropertyValues mpv = new MutablePropertyValues();
            mpv.addPropertyValue("schemaName", "core");
            Calendar cal = Calendar.getInstance();
            cal.setTime(new Date());
            cal.add(Calendar.DATE, -1);
            String sql = "SELECT t.formtype, count(*) as total FROM ehr.tasks t WHERE cast(t.created as date) = '" + _dateFormat.format(cal.getTime()) + "' GROUP BY t.formtype ORDER BY t.formtype";
            mpv.addPropertyValue("sql", sql);

            BindException errors = new NullSafeBindException(new Object(), "command");
            UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "core");
            QuerySettings qs = us.getSettings(mpv, "query");
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), "-7d", CompareType.DATE_GTE);
            qs.setBaseFilter(filter);
            QueryView view = new QueryView(us, qs, errors);

            rs = view.getResults();
            if (rs.next())
            {
                msg.append("Number of Forms Created Yesterday: <br>\n");
                do
                {
                    msg.append(rs.getString("formtype") + ": " + rs.getInt("total") + "<br>\n");
                }
                while (rs.next());

                msg.append("<p>\n");
            }
            rs.close();

            //also query records
            mpv = new MutablePropertyValues();
            mpv.addPropertyValue("schemaName", "core");
            sql = "SELECT Dataset.Label as label, count(*) as total FROM study.studydata WHERE cast(created as date) = '" + _dateFormat.format(cal.getTime()) + "' and taskid is not null GROUP BY Dataset.Label ORDER BY Dataset.Label";
            mpv.addPropertyValue("sql", sql);

            errors = new NullSafeBindException(new Object(), "command");
            qs = us.getSettings(mpv, "query");
            qs.setBaseFilter(filter);
            view = new QueryView(us, qs, errors);

            rs = view.getResults();
            if (rs.next())
            {
                msg.append("Number of Records Created Yesterday Through Labkey: <br>\n");
                do
                {
                    msg.append(rs.getString("label") + ": " + rs.getInt("total") + "<br>\n");
                }
                while (rs.next());

                msg.append("<p>\n");
            }
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ResultSetUtil.close(rs);
        }
    }
}