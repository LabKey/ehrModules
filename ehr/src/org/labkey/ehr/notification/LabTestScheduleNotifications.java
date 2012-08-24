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
 * Time: 8:27 PM
 */
public class LabTestScheduleNotifications extends AbstractNotification
{
    public String getName()
    {
        return "Lab Schedule Alerts";
    }

    public String getEmailSubject()
    {
        return "Lab Test Schedule Alerts: " + _dateTimeFormat.format(new Date());
    }

    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 1, TimeUnit.DAYS));
        return tasks;
    }

    public String getScheduleDescription()
    {
        //TODO
        return "every day";
    }

    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    public String getDescription()
    {
        return "The report provides alerts related to the lab test schedule.";
    }

    public String getMessage()
    {
        final StringBuilder msg = new StringBuilder();

        Calendar cal = Calendar.getInstance();
        cal.setTime(new Date());
        cal.add(Calendar.DATE, -1);

        msg.append("This email contains clinpath results entered since: " + _dateTimeFormat.format(cal.getTime()) + ".<p>");

        requestsSubmittedSinceLastEmail(msg);
        requestsNotYetApproved(msg);
        testsNotYetCompleted(msg);

        return msg.toString();
    }

    /**
     * we find any record requested since the last email
     * @param msg
     */
    private void requestsSubmittedSinceLastEmail(StringBuilder msg)
    {
        Date lastRun = new Date(getLastRun());
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), "Request: Pending");
        filter.addCondition(FieldKey.fromString("created"), lastRun, CompareType.GTE);

        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "Clinpath Runs");
        mpv.addPropertyValue("query.sort", "Id,date");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            msg.append("<b>Clinpath requests created since the last time this email was sent on " + _dateTimeFormat.format(lastRun) + ":</b><p>\n");
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
                msg.append("There are " +  total + " requests.<br>");
                msg.append("<p><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/dataEntry.view#topTab:Requests&activeReport:ClinpathRequests'>Click here to view them</a><br>\n");
            }
            else
            {
                msg.append("No new requests have been entered.<br>");
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

    /**
     * we find any requests not yet approved
     * @param msg
     */
    private void requestsNotYetApproved(StringBuilder msg)
    {
        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "Clinpath Runs");
        mpv.addPropertyValue("query.sort", "Id,date");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), "Request: Pending");
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            msg.append("<b>Clinpath requests that have not been approved or denied yet:</b><p>\n");
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
                msg.append("WARNING: There are " + total + " requests that have not been approved or denied yet.<br>");
                msg.append("<p><a href='" + AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/ehr" + _ehrContainer.getPath() + "/dataEntry.view#topTab:Requests&activeReport:ClinpathRequests'>Click here to view them</a><br>\n");
            }
            else
            {
                msg.append("There are no requests that have not been approved or denied yet.<br>");
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

    /**
     * we find any record not completed where the date requested is today
     * @param msg
     */
    private void testsNotYetCompleted(StringBuilder msg)
    {
        MutablePropertyValues mpv = new MutablePropertyValues();
        mpv.addPropertyValue("schemaName", "study");
        mpv.addPropertyValue("query.queryName", "Clinpath Runs");
        mpv.addPropertyValue("query.sort", "Id,date");

        BindException errors = new NullSafeBindException(new Object(), "command");
        UserSchema us = QueryService.get().getUserSchema(_ns.getUser(), _ehrContainer, "study");
        QuerySettings qs = us.getSettings(mpv, "query");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("qcstate/label"), "Completed", CompareType.NEQ_OR_NULL);
        filter.addCondition(FieldKey.fromString("date"), new Date(), CompareType.DATE_LTE);
        qs.setBaseFilter(filter);
        QueryView view = new QueryView(us, qs, errors);
        Results rs = null;
        try
        {
            rs = view.getResults();
            msg.append("<b>Clinpath requests requested for today, but have not been marked complete:</b><p>\n");
            int total = 0;
            while (rs.next())
            {
                total++;
            }

            if (total > 0)
            {
                msg.append("<b>WARNING: There are " + total + " requests that were requested for today or earlier, but have not been marked complete.</b><br>");
                msg.append("<p><a href='" +  _baseUrl + "/executeQuery.view?schemaName=study&query.queryName=Clinpath Runs&query.qcstate/label~neq=Completed&query.date~datelte=" + _dateFormat.format(new Date()) + "'>Click here to view them</a><br>\n");
                msg.append("<hr>\n");
            }
            else
            {
                msg.append("There are not incomplete tests for today");
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