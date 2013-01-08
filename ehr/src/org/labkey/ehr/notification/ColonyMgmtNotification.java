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

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:28 PM
 */
public class ColonyMgmtNotification extends ColonyAlertsNotification
{
    @Override
    public String getName()
    {
        return "Colony Management Notification";
    }

    @Override
    public String getEmailSubject()
    {
        return "Colony Management Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return "0 10 6 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "every day at 6:10AM";
    }

    @Override
    public String getDescription()
    {
        return "The report is designed to identify potential problems with the colony, tailored toward colony managers.";
    }

    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts for colony management.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        livingAnimalsWithoutWeight(c, u, msg);
        cagesWithoutDimensions(c, u, msg);
        findAnimalsInPC(c, u, msg);
        cageReview(c, u, msg);
        animalsLackingAssignments(c, u, msg);
        activeAssignmentsForDeadAnimals(c, u, msg);
        assignmentsWithoutValidProtocol(c, u, msg);
        duplicateAssignments(c, u, msg);
        animalsWithHoldCodesNotOnPending(c, u, msg);
        protocolsNearingLimit(c, u, msg);

        return msg.toString();
    }
}
