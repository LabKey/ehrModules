package org.labkey.ehr.notification;

import java.util.ArrayList;
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
    public List<ScheduledFuture> schedule(int delay)
    {
        List<ScheduledFuture> tasks = new ArrayList<ScheduledFuture>();
        //TODO: 10AM
        tasks.add(NotificationService.get().getExecutor().scheduleWithFixedDelay(this, delay, 1, TimeUnit.DAYS));
        return tasks;
    }

    @Override
    public String getScheduleDescription()
    {
        //TODO
        return "daily at 10AM";
    }

    @Override
    public String getMessage()
    {
        StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains any scheduled blood draws not marked as completed.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        bloodDrawsOnDeadAnimals(msg);
        bloodDrawsOverLimit(msg);
        bloodDrawsNotAssignedToProject(msg);
        findNonApprovedDraws(msg);
        drawsNotAssigned(msg);
        incompleteDraws(msg);

        return msg.toString();
    }
}
