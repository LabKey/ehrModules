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
package org.labkey.ehr.notification;

import org.labkey.api.action.NullSafeBindException;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QuerySettings;
import org.labkey.api.query.QueryView;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.util.ResultSetUtil;
import org.springframework.beans.MutablePropertyValues;
import org.springframework.validation.BindException;

import java.io.IOException;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:28 PM
 */
public class OverdueWeightsNotification extends AbstractEHRNotification
{
    @Override
    public String getName()
    {
        return "Overdue Weight Alerts";
    }

    @Override
    public String getEmailSubject()
    {
        return "Overdue Weight Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 10 10 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 10:10AM";
    }

    @Override
    public String getDescription()
    {
        return "The report sends alerts for any animal without a weight or not weighted within the past 60 days.";
    }

    @Override
    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        msg.append("This email contains alerts of animals not weighed in the past 60 days.  It was run on: " + _dateTimeFormat.format(new Date())+ ".<p>");

        livingAnimalsWithoutWeight(c, u, msg);
        animalsNotWeightedInPast60Days(c, u, msg);

        return msg.toString();
    }

    /**
     * find animals not weighed in the past 60 days
     * @param msg
     */
    private void animalsNotWeightedInPast60Days(Container c, User u, StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/MostRecentWeight/DaysSinceWeight"), 60, CompareType.GT);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "Demographics");
        mpv.addPropertyValue("query.viewName", "Weight Detail");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(u, c, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            if (rs.next())
            {
                msg.append("<b>WARNING: The following animals have not been weighed in the past 60 days:</b><br>");
                msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.viewName=By Location&query.queryName=Demographics&query.Id/MostRecentWeight/DaysSinceWeight~gt=60&query.calculated_status~eq=Alive'>Click here to view them</a><p>\n");

                Map<String, Map<String, Map<String, Object>>> summary = new HashMap<String, Map<String, Map<String, Object>>>();
                do
                {
                    String area = rs.getString(FieldKey.fromString("Id/curLocation/Area"));
                    if (area == null)
                        area = "No Area";
                    String room = rs.getString(FieldKey.fromString("Id/curLocation/Room"));
                    if (room == null)
                        room = "No Room";

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
                    html.append("<tr><td>" + appendField("Id/curLocation/cage", rs) + "</td><td>" + appendField("Id", rs) + "</td><td>" + appendField("Id/MostRecentWeight/DaysSinceWeight", rs) + "</td></tr>");

                    //roomNode.put("html", html);
                    areaNode.put(room, roomNode);
                    summary.put(area, areaNode);
                }
                while (rs.next());

                for (String area : summary.keySet())
                {
                    msg.append("<b>Area: " + area + "</b><br><br>\n");
                    Map<String, Map<String, Object>> areaNode = summary.get(area);
                    for (String room : areaNode.keySet())
                    {
                        Map<String, Object> roomNode = areaNode.get(room);
                        msg.append("Room: " + room + "<br>\n");
                        msg.append("<table border=1><tr><td>Cage</td><td>Id</td><td>Days Since Weight</td></tr>");
                        msg.append((StringBuilder)roomNode.get("html"));
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

    protected void livingAnimalsWithoutWeight(final Container c, User u, final StringBuilder msg)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("calculated_status"), "Alive");
        filter.addCondition(FieldKey.fromString("Id/MostRecentWeight/MostRecentWeightDate"), null, CompareType.ISBLANK);
        Sort sort = new Sort(getStudy(c).getSubjectColumnName());
        TableSelector ts = new TableSelector(getStudySchema(c, u).getTable("Demographics"), Collections.singleton(getStudy(c).getSubjectColumnName()), filter, sort);
        if (ts.getRowCount() > 0)
        {
            msg.append("<b>WARNING: The following animals do not have a weight:</b><br>\n");
            ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                public void exec(ResultSet rs) throws SQLException
                {
                    msg.append(rs.getString(getStudy(c).getSubjectColumnName()) + "<br>\n");
                }
            });

            msg.append("<p><a href='" + _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Demographics&query.calculated_status~eq=Alive&query.Id/MostRecentWeight/MostRecentWeightDate~isblank'>Click here to view these animals</a></p>\n");
            msg.append("<hr>\n");
        }
    }
}
