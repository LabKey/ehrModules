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

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:28 PM
 */
public class ColonyAlertsLiteNotification extends ColonyAlertsNotification
{
    @Override
    public String getName()
    {
        return "Colony Alerts Lite";
    }

    @Override
    public String getEmailSubject()
    {
        return "Colony Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 60, TimeUnit.MINUTES));
        return tasks;
    }

    @Override
    public String getScheduleDescription()
    {
        return "every 60 minutes";
    }

    @Override
    public String getDescription()
    {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.  It runs a subset of the alerts from Colony Alerts and will send an email only if problems are found.";
    }

    public String getMessage()
    {
        final StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts about the colony.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        multipleHousingRecords(msg);
        validateActiveHousing(msg);
        housingConditionProblems(msg);
        deadAnimalsWithActiveHousing(msg);
        livingAnimalsWithoutHousing(msg);
        calculatedStatusFieldProblems(msg);
        animalsLackingAssignments(msg);
        deadAnimalsWithActiveAssignments(msg);
        assignmentsWithoutValidProtocol(msg);
        duplicateAssignments(msg);
        nonContiguousHousing(msg);

        return msg.toString();
    }
}
