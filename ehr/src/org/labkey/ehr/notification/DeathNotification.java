package org.labkey.ehr.notification;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;

/**
 * User: bimber
 * Date: 12/10/13
 * Time: 5:58 PM
 */
public class DeathNotification extends AbstractEHRNotification
{
    @Override
    public String getName()
    {
        return "Death Notification";
    }

    @Override
    public String getEmailSubject()
    {
        return "Death Notification: " + _dateTimeFormat.format(new Date());
    }

    @Override
    public String getCronString()
    {
        return null;
    }

    @Override
    public String getScheduleDescription()
    {
        return "Sent immediately when an animal is marked as dead";
    }

    @Override
    public String getDescription()
    {
        return "The report sends an alert whenever an animal is marked as dead.";
    }

    @Override
    public String getMessage(Container c, User u)
    {
        final StringBuilder msg = new StringBuilder();
        msg.append("This email contains alerts of animals in cage locations not weighed in the past 60 days.  It was run on: " + _dateTimeFormat.format(new Date())+ ".<p>");

        return msg.toString();
    }
}
