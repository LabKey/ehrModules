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
package org.labkey.ehr.notification;

import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.settings.AppProps;
import org.labkey.api.util.ResultSetUtil;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.validation.BindException;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:26 PM
 */
public class LabResultSummaryNotification extends AbstractEHRNotification
{
    public String getName()
    {
        return "Lab Result Summary";
    }

    public String getEmailSubject()
    {
        return "Daily Lab Result Summary: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 30 14 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 2:30PM";
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public String getDescription()
    {
        return "The report provides a daily summary of all lab tests finalized in the EHR.";
    }

    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();

        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -1);

        msg.append("This email contains clinpath results entered since: " + _dateTimeFormat.format(cal.getTime()) + ".<p>");

        findPreviousResults(c, u, msg);

        return msg.toString();
    }

    /**
     * we find any record requested since the last email
     */
    public void findPreviousResults(Container c, User u, StringBuilder msg)
    {
        //yesterday
        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -1);

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/PublicData"), true);
        filter.addCondition(FieldKey.fromString("taskid/datecompleted"), cal.getTime(), CompareType.DATE_GTE);
        filter.addCondition(FieldKey.fromString("taskid/datecompleted"), null, CompareType.NONBLANK);
        filter.addCondition(FieldKey.fromString("dateReviewed"), null, CompareType.ISBLANK);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "Clinpath Runs");
        mpv.addPropertyValue("query.columns", "Id,date,Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,serviceRequested,requestId,requestid/description,reviewedBy,dateReviewed");
        mpv.addPropertyValue("query.sort", "Id,date");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(u, c, "study");
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
                msg.append("There are " + total + " completed requests since " + _dateTimeFormat.format(cal.getTime()) + ". Below is a summary.  Click the Animal Id for more detail.  <br>");
                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Clinpath Runs&query.viewName=Plus Room&query.taskid/datecompleted~dategte=" + _dateFormat.format(cal.getTime()) + "&query.taskid/datecompleted~nonblank'>Click here to view them</a><p>\n");

                Map<String, Map<String, StringBuilder>> summary = new HashMap<String, Map<String, StringBuilder>>();
                do
                {
                    String area = rs.getString(FieldKey.fromParts("Id/curLocation/area"));
                    if (area == null)
                        area = "No Active Housing";

                    String room = rs.getString(FieldKey.fromParts("Id/curLocation/room"));
                    if (room == null)
                        room = "No Room";

                    String description = rs.getString(FieldKey.fromParts("requestid/description"));
                    if (description == null)
                        description = "";
                    description = description.replaceAll("\n", "<br>");

                    Map<String, StringBuilder> areaNode = summary.get(area);
                    if (areaNode == null)
                        areaNode = new HashMap<String, StringBuilder>();

                    StringBuilder sb = areaNode.get(room);
                    if (sb == null)
                        sb = new StringBuilder();

                    sb.append("<tr><td><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + c.getPath() + "/animalHistory.view?#_inputType:renderSingleSubject&_showReport:1&subject:");
                    sb.append(rs.getString(FieldKey.fromString("Id")) + "&combineSubj:true&activeReport:clinPathRuns'>" + rs.getString(FieldKey.fromString("Id")) +  "</a></td><td>" + _dateFormat.format(rs.getDate(FieldKey.fromString("date"))) + "</td><td>" + rs.getString(FieldKey.fromString("serviceRequested")) + "</td><td>" + description + "</td><td>");
                    sb.append((rs.getString(FieldKey.fromString("dateReviewed")) == null ? "" : rs.getString(FieldKey.fromString("dateReviewed"))) + "</td><td" + (rs.getString(FieldKey.fromString("reviewedBy"))==null ? "" : " style=background:red;") + ">" + (rs.getString(FieldKey.fromString("reviewedBy"))==null ? "" : rs.getString(FieldKey.fromString("reviewedBy")) + "</td></tr>"));

                    areaNode.put(room, sb);
                    summary.put(area, areaNode);
                }
                while (rs.next());

                for (String area : summary.keySet())
                {
                    msg.append("<b>" + area + ":</b><br>\n");
                    Map<String, StringBuilder> areaNode = summary.get(area);

                    for (String room : areaNode.keySet())
                    {
                        msg.append(room + ":<br>\n");
                        msg.append("<table border=1><tr><td>Id</td><td>Collect Date</td><td>Service Requested</td><td>Requestor</td><td>Date Reviewed</td><td>Reviewed By</td></tr>");

                        StringBuilder sb = areaNode.get(room);
                        msg.append(sb);

                        msg.append("</table><p>\n");
                    }
                }
		        msg.append("<p>");
            }
            else
            {
                msg.append("No requests have been completed during this timeframe.<br>");
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
