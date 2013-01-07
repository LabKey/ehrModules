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

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;

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
    public String getCronString()
    {
        return "0 5 0/1 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every 60 minutes, 5 min past the hour";
    }

    @Override
    public String getDescription()
    {
        return "The report is designed to identify potential problems with the colony, primarily related to weights, housing and assignments.  It runs a subset of the alerts from Colony Alerts and will send an email only if problems are found.";
    }

    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts about the colony.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        multipleHousingRecords(c, u, msg);
        validateActiveHousing(c, u, msg);
        deadAnimalsWithActiveHousing(c, u, msg);
        livingAnimalsWithoutHousing(c, u, msg);
        calculatedStatusFieldProblems(c, u, msg);
        animalsLackingAssignments(c, u, msg);
        deadAnimalsWithActiveAssignments(c, u, msg);
        assignmentsWithoutValidProtocol(c, u, msg);
        duplicateAssignments(c, u, msg);
        nonContiguousHousing(c, u, msg);

        return msg.toString();
    }
}
