package org.labkey.ehr.notification;

import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableSelector;
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
import java.sql.ResultSet;
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
 * Time: 4:30 PM
 */
public class BloodAdminAlertsNotification extends AbstractNotification
{
    public static enum TimeOfDay {
        AM(9),
        Noon(12),
        PM(15);

        private TimeOfDay(int hour)
        {
            this.hour = hour;
        }

        private int hour;
    }

    public String getName()
    {
        return "Blood Admin Alerts";
    }

    public String getDescription()
    {
        return "This runs periodically during the day and sends alerts for incomplete blood draws and other potential problems in the blood draw schedule.";
    }

    public String getEmailSubject()
    {
        return "Blood Admin Alerts: " + _dateTimeFormat.format(new Date());
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        //TODO: 10AM, 1PM, etc
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

        //Find today's date
        Date now = new Date();
        msg.append("This email contains any scheduled blood draws not marked as completed, along with other potential problems in the blood schedule.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        bloodDrawsOnDeadAnimals(msg);
        bloodDrawsOverLimit(msg);
        bloodDrawsNotAssignedToProject(msg);
        findNonApprovedDraws(msg);
        drawsNotAssigned(msg);
        incompleteDraws(msg);

        drawsWithServicesAndNoRequest(msg);

        return msg.toString();
    }

    /**
     * we find any current or future blood draws where the animal is not alive
     */
    protected void bloodDrawsOnDeadAnimals(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Request: Denied", CompareType.NEQ);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_GTE);
        TableSelector ts = new TableSelector(_studySchema.getTable("Blood Draws"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " current or scheduled blood draws for animals not currently at WNPRC.</b><br>");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Blood Draws&query.date~dategte=$datestr&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find any blood draws over the allowable limit
     */
    protected void bloodDrawsOverLimit(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Request: Denied", CompareType.NEQ);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("BloodRemaining/AvailBlood"), 0, CompareType.LT);
        TableSelector ts = new TableSelector(_studySchema.getTable("Blood Draws"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
	        msg.append("<b>WARNING: There are " + ts.getRowCount() + " scheduled blood draws exceeding the allowable volume.</b><br>");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>()
            {
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Blood Draws&query.viewName=Blood Summary&query.date~dategte=$datestr&query.Id/Dataset/Demographics/calculated_status~eq=Alive&query.BloodRemaining/AvailBlood~lt=0'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
        else {
            msg.append("There are no future blood draws exceeding the allowable amount based on current weights.<br>");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find any blood draws where the animal is not assigned to that project
     */
    protected void bloodDrawsNotAssignedToProject(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Request: Denied", CompareType.NEQ);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("projectStatus"), null, CompareType.NONBLANK);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "BloodSchedule");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            int total = 0;
            //calculate row count
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {

                msg.append("<b>WARNING: There are " + total + " blood draws scheduled today or in the future where the animal is not assigned to the project.</b><br>");

                do
                {
                    msg.append(rs.getString(_ehrStudy.getSubjectColumnName()) + "<br>\n");
                }
                while (rs.next());

                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dategte=" + _dateFormat.format(new Date()) + "'>Click here to view them</a><br>\n");
                msg.append("<hr>\n");
            }
            else
            {
                msg.append("All blood draws today and in the future have a valid project for the animal.<br>");
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

    /**
     * find any blood draws not yet approved
     */
    protected void findNonApprovedDraws(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Request: Pending");
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_GTE);
        TableSelector ts = new TableSelector(_studySchema.getTable("Blood Draws"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " blood draws requested that have not been approved or denied yet.</b><br>");
            msg.append("<p><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/dataEntry.view#topTab:Requests&activeReport:BloodDrawRequests'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
        else {
            msg.append("All requested blood draws have been either approved or denied.<br>");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find any blood draws not yet assigned to either SPI or animal care
     */
    protected void drawsNotAssigned(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Request: Denied", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("billedby"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Blood Draws"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " blood draws requested that have not been assigned to SPI or Animal Care.</b><br>");
            msg.append("<p><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/dataEntry.view#topTab:Requests&activeReport:BloodDrawRequests'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
        else {
            msg.append("All requested blood draws have been assigned to a group to perform them.<br>");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find any current blood draws with clinpath, but lacking a request
     */
    protected void drawsWithServicesAndNoRequest(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("path_lsid"), null, CompareType.ISBLANK);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_EQUAL);
        TableSelector ts = new TableSelector(_studySchema.getTable("ValidateBloodDrawClinpath"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " blood draws scheduled today that request clinpath, but lack a corresponding clinpath request.</b><br>");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=ValidateBloodDrawClinpath&query.viewName=Lacking Clinpath Request&query.date~dateeq=" + _dateFormat.format(new Date()) + "'>Click here to view them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    /*
     * we find any incomplete blood draws scheduled today, by area
     */
    protected void incompleteDraws(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Request: Denied", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("qcstate/label"), "Completed", CompareType.NEQ_OR_NULL);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "BloodSchedule");
        mpv.addPropertyValue("query.columns", "drawStatus,daterequested,project,date,project/protocol,taskid,projectStatus,tube_vol,tube_type,billedby,billedby/title,num_tubes,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,additionalServices,remark,Id,quantity,qcstate,qcstate/Label,requestid");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            if (!rs.next())
            {
                msg.append("There are no blood draws scheduled for " + _dateFormat.format(new Date()) + ".\n");
            }
            else
            {
                Integer complete = 0;
                Integer incomplete = 0;

                Map<String, Map<String, Map<String, Object>>> summary = new HashMap<String, Map<String, Map<String, Object>>>();

                do
                {
                    if(rs.getString(FieldKey.fromString("qcstate/Label")) != null && rs.getString(FieldKey.fromString("qcstate/Label")).equals("Completed")){
                        complete++;
                    }
                    else
                    {
                        String area = rs.getString(FieldKey.fromParts("Id/curLocation/area"));
                        String room = rs.getString(FieldKey.fromParts("Id/curLocation/room"));

                        Map<String, Map<String, Object>> areaNode = summary.get(area);
                        if (areaNode == null)
                            areaNode = new HashMap<String, Map<String, Object>>();

                        Map<String, Object> roomNode = areaNode.get(room);
                        if (roomNode == null)
                        {
                            roomNode = new HashMap<String, Object>();
                            roomNode.put("complete", 0);
                            roomNode.put("incomplete", 0);
                            roomNode.put("cagesHtml", new StringBuilder());
                        }

                        roomNode.put("incomplete", ((Integer)roomNode.get("incomplete") + 1));

                        StringBuilder b = (StringBuilder)roomNode.get("cagesHtml");
                        b.append("<tr><td>" + _dateTimeFormat.format(rs.getDate("daterequested")) + "</td><td>" +  rs.getString("Id") + "</td><td>" + (rs.getString("tube_vol")==null ? "" : rs.getString("tube_vol") + " mL") + "</td><td>" + (rs.getString("tube_type")==null ? "" : rs.getString("tube_type")) + "</td><td>" + (rs.getString("num_tubes")==null ? "" : rs.getString("num_tubes")) + "</td><td>" + (rs.getString("quantity")==null ? "" : rs.getString("quantity") + " mL") + "</td><td>" + (rs.getString("additionalServices")==null ? "" : rs.getString("additionalServices")) + "</td><td>" + (rs.getString(FieldKey.fromString("billedby/title"))==null ? "" : rs.getString(FieldKey.fromString("billedby/title"))) + "</td></tr>\n");

                        areaNode.put(room, roomNode);
                        summary.put(area, areaNode);
                    }
                }
                while (rs.next());

                String url = "<a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=BloodSchedule&query.date~dateeq=$datestr&query.Id/DataSet/Demographics/calculated_status~eq=Alive'>Click here to view them</a></p>\n";
                msg.append("There are " + (incomplete + complete) + " scheduled blood draws for $datestr.  " + complete + " have been completed.  " + url + "<p>\n");

                if(incomplete == 0)
                {
                    msg.append("All scheduled blood draws have been marked complete as of $datetimestr.<p>\n");
                }
                else
                {
                    msg.append("The following blood draws have not been marked complete as of $datetimestr:<p>\n");

                    for (String area : summary.keySet())
                    {
                        msg.append("<b>" + area + ":</b><br>\n");
                        Map<String, Map<String, Object>> areaNode = summary.get(area);

                        for (String room: areaNode.keySet())
                        {
                            Map<String, Object> roomNode = areaNode.get(room);
                            msg.append(room + ": " + (Integer)roomNode.get("incomplete") + "<br>\n");
                            msg.append("<table border=1><tr><td>Time Requested</td><td>Id</td><td>Tube Vol</td><td>Tube Type</td><td># Tubes</td><td>Total Quantity</td><td>Additional Services</td><td>Assigned To</td></tr>\n");
                            msg.append((StringBuilder)roomNode.get("cageHtml"));
                            msg.append("</table><p>\n");
                        }

                        msg.append("<p>\n");
                    }
                }
            }
            msg.append("<hr>\n");
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
