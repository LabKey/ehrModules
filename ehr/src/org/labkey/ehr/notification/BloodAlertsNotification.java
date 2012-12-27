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

import java.util.Collections;
import java.util.Date;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 8/4/12
 * Time: 8:25 PM
 */
public class BloodAlertsNotification extends BloodAdminAlertsNotification
{
    @Override
    public String getName()
    {
        return "Blood Alerts";
    }

    @Override
    public String getDescription()
    {
        return "This report will alert users of scheduled blood draws that have not yet been marked complete.";
    }

    @Override
    public String getEmailSubject()
    {
        return "Blood Alerts: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public Set<String> getNotificationTypes()
    {
        return Collections.singleton(getName());
    }

    @Override
    public String getCronString()
    {
        return "0 0 10 * * ?";
    }

    @Override
    public String getScheduleDescription()
    {
        return "daily at 10AM";
    }

    @Override
    public String getMessage(Container c, User u)
    {
        StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains any scheduled blood draws not marked as completed.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        bloodDrawsOnDeadAnimals(c, u, msg);
        bloodDrawsOverLimit(c, u, msg);
        bloodDrawsNotAssignedToProject(c, u, msg);
        findNonApprovedDraws(c, u, msg);
        drawsNotAssigned(c, u, msg);
        incompleteDraws(c, u, msg);

        return msg.toString();
    }
}
