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
        return "The report is designed to identify potential problems with the colony, tailored toward colony managers.";
    }

    public String getMessage()
    {
        final StringBuilder msg = new StringBuilder();

        //Find today's date
        Date now = new Date();
        msg.append("This email contains a series of automatic alerts for colony management.  It was run on: " + _dateFormat.format(now) + " at " + _timeFormat.format(now) + ".<p>");

        livingAnimalsWithoutWeight(msg);
        cagesWithoutDimensions(msg);
        findAnimalsInPC(msg);
        housingConditionProblems(msg);
        cageReview(msg);
        animalsLackingAssignments(msg);
        activeAssignmentsForDeadAnimals(msg);
        assignmentsWithoutValidProtocol(msg);
        duplicateAssignments(msg);
        animalsWithHoldCodesNotOnPending(msg);
        protocolsNearingLimit(msg);

        return msg.toString();
    }
}
