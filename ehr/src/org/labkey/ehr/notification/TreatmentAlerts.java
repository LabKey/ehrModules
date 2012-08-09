package org.labkey.ehr.notification;

import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
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
 * Time: 8:29 PM
 */
public class TreatmentAlerts extends AbstractNotification
{
    public String getName()
    {
        return "Treatment Alerts";
    }

    public String getDescription()
    {
        return "This runs every day at 10AM, 1PM and 4PM if there are treatments scheduled that have not yet been marked complete";
    }

    public String getEmailSubject()
    {
        return "Daily Treatment Alerts: " + _dateTimeFormat.format(new Date());
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        //TODO: schedule at specific times
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 1, TimeUnit.DAYS));
        return tasks;
    }

    public String getScheduleDescription()
    {
        return "daily at 10AM, 1PM and 4PM";
    }

    public String getMessage()
    {
        StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains any treatments not marked as completed.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        findRoomsLackingObs(msg);
        findTreatmentsWithoutProject(msg);

        processTreatments(msg, "AM", new Date(), true);

        treatmentsThatDiffer(msg);
        treatmentsForDeadAnimals(msg);
        casesForDeadAnimals(msg);

        return msg.toString();
    }

    /**
     * find any rooms lacking obs for today
     */
    private void findRoomsLackingObs(final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("hasObs"), "N");

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "ehr");
        mpv.addPropertyValue("query.queryName", "RoomsWithoutObsToday");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "ehr");
        QuerySettings qs = us.getSettings(mpv, "query");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            if (rs.next())
            {
                msg.append("<b>WARNING: The following rooms do not have any obs for today as of " + _timeFormat.format(new Date()) + ".</b><p>\n");
                msg.append("<a href='" + _baseUrl + "/executeQuery.view?schemaName=ehr&query.queryName=RoomsWithoutObsToday'>Click here to view them</a><p>\n");

                do
                {
                	msg.append(rs.getString("room") + "<br>");
                }
                while (rs.next());

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

    private void findTreatmentsWithoutProject(StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("projectStatus"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_EQUAL);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "treatmentSchedule");
        mpv.addPropertyValue("query.sort", "room");

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
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
               msg.append("<b>WARNING: There are " + total + " scheduled treatments where the animal is not assigned to the project.</b><br>");
               msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=treatmentSchedule&query.projectStatus~isnonblank&query.Id/DataSet/Demographics/calculated_status~eq=Alive&query.date~dateeq=$datestr'>Click here to view them</a><br>\n");
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

    private void processTreatments(StringBuilder msg, String timeOfDay, Date minTime, boolean noSendUnlessHasTreatments)
    {
        boolean shouldSend = false;
        StringBuilder sb = new StringBuilder();
        Date curTime = new Date();

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "treatmentSchedule");
        mpv.addPropertyValue("query.columns", "Id,CurrentArea,CurrentRoom,CurrentCage,projectStatus,treatmentStatus,treatmentStatus/Label,meaning,code,,volume2,conc2,route,amount2,remark,performedby");
        mpv.addPropertyValue("query.sort", "CurrentArea,CurrentRoom");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), new Date(), CompareType.DATE_EQUAL);
        filter.addCondition(FieldKey.fromString("timeofday"), timeOfDay);
        filter.addCondition(FieldKey.fromString("timeofday"), timeOfDay);
        filter.addCondition(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), timeOfDay);
        //['CurrentArea', 'in', join(';', @$areas)]
        qs.setBaseFilter(filter);

        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            msg.append("<b>" + timeOfDay + " Treatments:</b><p>");
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total == 0)
            {
                msg.append("There are no scheduled " + timeOfDay + " treatments as of " + _dateTimeFormat.format(new Date()) + ". Treatments could be added after this email was sent, so please check online closer to the time.<hr>\n");
                //TODO: verify this
                if(minTime.before(curTime) && noSendUnlessHasTreatments)
                    shouldSend = false;
            }
            else
            {
                int complete = 0;
                int incomplete = 0;
                Map<String, Map<String, Map<String, Object>>> summary = new HashMap<String, Map<String, Map<String, Object>>>();
                do
                {
                    if("Completed".equals(rs.getString(FieldKey.fromString("treatmentStatus/Label"))))
                    {
                        complete++;
                    }
                    else
                    {
                        String area = rs.getString(FieldKey.fromString("CurrentArea"));
                        String room = rs.getString(FieldKey.fromString("CurrentRoom"));
                        Map<String, Map<String, Object>> areaNode = summary.get(area);
                        if (areaNode == null)
                            areaNode = new HashMap<String, Map<String, Object>>();

                        Map<String, Object> roomNode = areaNode.get(room);
                        if (roomNode == null)
                        {
                            roomNode = new HashMap<String, Object>();
                            roomNode.put("incomplete", 0);
                            roomNode.put("complete", 0);
                            roomNode.put("html", new StringBuilder());
                        }

                        roomNode.put("incomplete", (((Integer)roomNode.get("incomplete")) + 1));
                        StringBuilder html = (StringBuilder)roomNode.get("html");
                        html.append("<tr><td>" + appendField("Id", rs) + "</td><td>" + appendField("meaning", rs) + "</td><td>" + appendField("route", rs) + "</td><td>" + appendField("conc2", rs) + "</td><td>" + appendField("amount2", rs) + "</td><td>" + appendField("volume2", rs) + "</td><td>" + appendField("remark", rs) + "</td><td>" + appendField("performedby", rs) + "</td></tr>");

                        areaNode.put(room, roomNode);
                        summary.put(area, areaNode);
                        incomplete++;
                    }
                }
                while (rs.next());

                String url = "<a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=treatmentSchedule&query.timeofday~eq=$timeofday&query.date~dateeq=$datestr&query.Id/DataSet/Demographics/calculated_status~eq=Alive'>Click here to view them</a></p>\n";
                msg.append("There are " + (complete + incomplete) + " scheduled $timeofday treatments.  $complete have been completed.  " + url + "<p>\n");

                if(minTime.before(curTime))
                {
                    if(incomplete == 0)
                    {
                        msg.append("All scheduled " + timeOfDay + " treatments have been marked complete as of " + _dateTimeFormat.format(curTime) + ".<p>\n");

                        if(noSendUnlessHasTreatments){
                            shouldSend = false;
                        }
                    }
                    else
                    {
                        msg.append("The following " + timeOfDay + " treatments have not been marked complete as of $datetimestr:<p>\n");
                        shouldSend = true;

                        for (String area : summary.keySet())
                        {
                            msg.append("<b>$area:</b><br>\n");
                            Map<String, Map<String, Object>> areaNode = summary.get(area);
                            for (String room : areaNode.keySet())
                            {
                                Map<String, Object> roomNode = areaNode.get(room);
                                Integer ic = ((Integer)roomNode.get("incomplete"));
                                if (ic > 0)
                                {
                                    msg.append(room + ": " + ic + "<br>\n");
                                    msg.append("<table border=1><tr><td>Id</td><td>Treatment</td><td>Route</td><td>Concentration</td><td>Amount To Give</td><td>Volume</td><td>Instructions</td><td>Ordered By</td></tr>");
                                    msg.append((StringBuilder)roomNode.get("html"));
                                    msg.append("</table><p>\n");
                                }

                            }
                            msg.append("<p>");
                        }
                    }
                }
                else
                {
                    msg.append("It is too early in the day to send warnings about incomplete treatments\n");
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

    /**
     * then any treatments from today that different from the order
     * @param msg
     */
    private void treatmentsThatDiffer(StringBuilder msg)
    {
        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "TreatmentsThatDiffer");
        mpv.addPropertyValue("query.sort", _ehrStudy.getSubjectColumnName());

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("date"), new Date(), CompareType.DATE_EQUAL);
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        msg.append("<b>Treatments that differ from what was ordered:</b><p/>");

        try
        {
            rs = view.getResults();
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total == 0)
            {
    	        msg.append("All entered treatments given match what was ordered.");
            }
            else
            {
                msg.append("<a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=TreatmentsThatDiffer&query.date~dateeq=$datestr'>Click here to view them</a><p/>\n");

                Map<String, Map<String, Map<String, Object>>> summary = new HashMap<String, Map<String, Map<String, Object>>>();
                do
                {
                    String area = rs.getString("CurrentArea");
                    String room = rs.getString("CurrentRoom");
                    Map<String, Map<String, Object>> areaNode = summary.get(area);
                    if (areaNode == null)
                        areaNode = new HashMap<String, Map<String, Object>>();

                    Map<String, Object> roomNode = areaNode.get(room);
                    if (roomNode == null)
                    {
                        roomNode = new HashMap<String, Object>();
                        roomNode.put("total", 0);
                        roomNode.put("html", new StringBuilder());
                    }

                    roomNode.put("incomplete", (((Integer)roomNode.get("incomplete")) + 1));
                    StringBuilder html = (StringBuilder)roomNode.get("html");


                    html.append("<tr><td>");
                    html.append("Id: " + appendField("id", rs) + "<br>\n");
                    html.append("Date: " + appendField("date", rs) + "<br>\n");
                    html.append("Treatment: " + appendField("meaning", rs) + "<br>\n");
                    html.append("Ordered By: " + appendField("performedby", rs) + "<br>\n");
                    html.append("Performed By: " + appendField("drug_performedby", rs) + "<br>\n");

                    if(rs.getString("route") != null && !rs.getString("route").equals(rs.getString("drug_route")))
                    {
                        html.append("Route Ordered: " + appendField("route", rs) + "<br>\n");
                        html.append("Route Entered: " + appendField("drug_route", rs) + "<br>\n");
                    }

                    if((rs.getString("concentration") != null && !rs.getString("concentration").equals(rs.getString("drug_concentration")))
                        || (rs.getString("conc_units") != null && !rs.getString("conc_units").equals("drug_conc_units")))
                    {
                        html.append("Concentration Ordered: " + appendField("concentration", rs) + appendField("conc_units", rs) + "<br>\n");
                        html.append("Concentration Entered: " + appendField("drug_concentration", rs) + appendField("drug_conc_units", rs) + "<br>\n");
                    }
                    if ((rs.getString("dosage") != null && !rs.getString("dosage").equals(rs.getString("drug_dosage")))
                        || (rs.getString("dosage_units") != null && !rs.getString("dosage_units").equals(rs.getString("drug_dosage_units"))))
                    {
                        msg.append("Dosage Ordered: " + appendField("dosage", rs) + " " + appendField("dosage_units", rs) + "<br>\n");
                        msg.append("Dosage Entered: " + appendField("drug_dosage", rs) + appendField("drug_dosage_units", rs) + "<br>\n");
                    }

                    if ((rs.getString("amount") != null && !rs.getString("amount").equals(rs.getString("drug_amount")))
                        || (rs.getString("amount_units") != null && !rs.getString("amount_units").equals(rs.getString("drug_amount_units"))))
                    {
                        msg.append("Amount Ordered: " + appendField("amount", rs) + " " + appendField("amount_units", rs) + "<br>\n");
                        msg.append("Amount Entered: " + appendField("drug_amount", rs) + appendField("drug_amount_units", rs) + "<br>\n");
                    }
                    if ((rs.getString("volume") != null && !rs.getString("volume").equals(rs.getString("drug_volume")))
                        || (rs.getString("vol_units") != null && !rs.getString("vol_units").equals(rs.getString("drug_vol_units"))))
                    {
                        msg.append("Volume Ordered: " + appendField("volume", rs) + " " + appendField("vol_units", rs) + "<br>\n");
                        msg.append("Volume Entered: " + appendField("drug_volume", rs) + " " + appendField("drug_vol_units", rs) + "<br>\n");
                    }

                    html.append("</td></tr>\n");
                    areaNode.put(room, roomNode);
                }
                while (rs.next());

                for (String area : summary.keySet())
                {
                    msg.append("<b>" + area + ":</b><br>\n");
                    Map<String, Map<String, Object>> areaNode = summary.get(area);
                    for (String room : areaNode.keySet())
                    {
                        Map<String, Object> roomNode = areaNode.get(room);
                        msg.append(room + ": " + (Integer)roomNode.get("incomplete") + "<br>\n");
                        msg.append("<table border=1>\n");
                        msg.append((StringBuilder)roomNode.get("html"));
                        msg.append("</table>\n");
                        msg.append("<p>\n");
                    }

                    msg.append("<p>");
                }
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

        msg.append("<hr>\n");
    }

    private void treatmentsForDeadAnimals(StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Treatment Orders"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " active treatments for animals not currently at WNPRC.</b>");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Treatment Orders&query.enddate~isblank&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n");
            msg.append("<hr>\n");
        }
    }

    /**
     * we find any open case where the animal is not alive
     */
    private void casesForDeadAnimals(StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id/DataSet/Demographics/calculated_status"), "Alive", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("enddate"), null, CompareType.ISBLANK);
        TableSelector ts = new TableSelector(_studySchema.getTable("Problem List"), Table.ALL_COLUMNS, filter, null);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: There are " + ts.getRowCount() + " unresolved problems for animals not currently at the center.</b>");
            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Problem List&query.enddate~isblank&query.Id/DataSet/Demographics/calculated_status~neqornull=Alive'>Click here to view and update them</a><br>\n");
            msg.append("<hr>\n");
        }
    }
}