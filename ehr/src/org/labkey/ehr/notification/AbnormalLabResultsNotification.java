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
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.ResultSetUtil;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.validation.BindException;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:26 PM
 */
public class AbnormalLabResultsNotification extends AbstractNotification
{
    public String getName()
    {
        return "Abornmal Lab Results";
    }

    public String getEmailSubject()
    {
        return "Abnormal Lab Results: " + _dateTimeFormat.format(new Date());
    }

    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 1, TimeUnit.DAYS));
        return tasks;
    }

    public String getScheduleDescription()
    {
        return "every day";
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public String getDescription()
    {
        return "The report provides a daily summary of all lab tests finalized in the EHR.";
    }

    public String getMessage()
    {
        final StringBuilder msg = new StringBuilder();

        Date lastRun;
        long lastRunTime = getLastRun();
        if (lastRunTime == 0)
            lastRun = new Date(0);
        else
            lastRun = new Date(getLastRun());

        msg.append("This email contains abnormal clinpath results that have been finalized since: " + _dateTimeFormat.format(lastRun) + ".<p>");

        findAbnormalResults(msg, lastRun);

        return msg.toString();
    }

    /**
     * we find any record requested since the last email with out of range results
     */
    public void findAbnormalResults(StringBuilder msg, Date lastRun)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/PublicData"), true);
        filter.addCondition(FieldKey.fromString("taskid/datecompleted"), lastRun, CompareType.GTE);
        filter.addCondition(FieldKey.fromString("taskid/datecompleted"), null, CompareType.NONBLANK);
        //filter.addCondition(FieldKey.fromString("alertStatus"), true);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "ClinpathRefRange");
        mpv.addPropertyValue("query.columns", "Id,date,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,alertStatus,taskid/datecompleted,testid,result,units,status,ref_range_min,ref_range_max,ageAtTime");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            boolean doSend = false;
            if (rs.next())
            {
                Map<String, Map<String, StringBuilder>> summary = new HashMap<String, Map<String, StringBuilder>>();

                int rowCount = 0;
                do
                {
                    if(rs.getBoolean(FieldKey.fromString("alertStatus")))
                        doSend = true;

                    String area = rs.getString(FieldKey.fromParts("Id/curLocation/area"));
                    if (area == null)
                        area = "No Active Housing";

                    String room = rs.getString(FieldKey.fromParts("Id/curLocation/room"));
                    if (room == null)
                        room = "No Room";

                    Map<String, StringBuilder> areaNode = summary.get(area);
                    if (areaNode == null)
                        areaNode = new HashMap<String, StringBuilder>();

                    StringBuilder sb = areaNode.get(room);
                    if (sb == null)
                        sb = new StringBuilder();


                    String description = rs.getString(FieldKey.fromString("description"));
                    if(description != null)
                        description = description.replaceAll("\n", "<br>");

                    //per row
                    String color = "";
                    if(rs.getString(FieldKey.fromString("ref_range_min")) != null && rs.getDouble(FieldKey.fromString("result")) < rs.getDouble(FieldKey.fromString("ref_range_min")))
                        color = "#FBEC5D";
                    else if (rs.getDouble(FieldKey.fromString("result")) > rs.getDouble(FieldKey.fromString("ref_range_max")))
                        color = "#E3170D";

                    sb.append("<tr><td><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/animalHistory.view?#_inputType:renderSingleSubject&_showReport:1&subject:" + appendField("Id", rs) + "&combineSubj:true&activeReport:clinPathRuns'>" + appendField("Id", rs) + "</a></td>");
                    sb.append("<td>" + appendField("date", rs) + "</td>");
                    sb.append("<td>" + appendField("taskid/datecompleted", rs) + "</td>");
                    sb.append("<td>" + appendField("testId", rs) + "</td>");
                    sb.append("<td>" + appendField("result", rs) + "</td>");
                    sb.append("<td>" + appendField("units", rs) + "</td>");
                    sb.append("<td" + (color != null ? " style=background:" + color + ";" : "") + ">" + appendField("status", rs)+ "</td>");
                    sb.append("<td>" + appendField("ref_range_min", rs) + "</td>");
                    sb.append("<td>" + appendField("ref_range_max", rs) + "</td>");
                    sb.append("<td>" + appendField("AgeAtTime", rs) + "</td>");
                    sb.append("</tr>");

                    areaNode.put(room, sb);
                    summary.put(area, areaNode);
                    rowCount++;
                }
                while (rs.next());

                msg.append("There have been " + rowCount + " abnormal results since " + _dateTimeFormat.format(lastRun) + ".<br>\n");
                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=ClinpathRefRange&query.taskid/datecompleted~gte=" + _dateTimeFormat.format(lastRun) + "&query.taskid/datecompleted~nonblank&query.qcstate/PublicData~eq=true'>Click here to view them</a><p>\n");

                for (String area : summary.keySet())
                {
                    msg.append("<b>" + area + ":</b><br>\n");
                    Map<String, StringBuilder> areaNode = summary.get(area);
                    for (String room: areaNode.keySet())
                    {
                        msg.append(room + ":<br>\n");
                        msg.append("<table border=1><tr><td>Id</td><td>Collect Date</td><td>Date Completed</td><td>Test Id</td><td>Result</td><td>Units</td><td>Status</td><td>Ref Range Min</td><td>Ref Range Max</td><td>Age At Time</td></tr>");
                        msg.append(areaNode.get(room));
                        msg.append("</table><p>\n");
                    }
                    msg.append("<p>");
                }
                msg.append("<hr>\n");
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