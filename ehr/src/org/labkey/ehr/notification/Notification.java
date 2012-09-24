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

import java.util.List;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 7/14/12
 * Time: 2:53 PM
 */
public interface Notification
{
    /**
     * This method is used to start the execution of this notification.  The notification may not start imeditately - timing of execution is
     * determined by schedule().  Methods extending AbstractNotification will generally not implement this.
     */
    public void start(int delay);

    /**
     * This method is used to stop the execution of active and future tasks.  Methods extending AbstractNotification will generally not implement this.
     */
    public void stop();

    /**
     * @return The display name used to identify this notification
     */
    public String getName();

    /**
     * This is the primary manner in which notifications control their schedule.  They can act using a fixed period (ie. hourly), or then can choose to
     * run at fixed points during the day (ie. every day at 2PM).  Tasks scheduled at multiple fixed points during the day can create multiple ScheduledFuture objects.
     * @param delay An optional delay to be included before any tasks start.  This is often used to prevent all tasks from starting immediately when the server starts.
     * @return A list of ScheduledFuture objects, representing any scheduled tasks
     */
    public List<ScheduledFuture> schedule(int delay);

    /**
     * @return The string describing the scheduled intervals.  This is solely used for display purposes, because it is difficult to translate the a list of ScheduledFuture object into english.
     * This string should make sense in the context of: 'Schedule : ' + {description here}
     */
    public String getScheduleDescription();

    /**
     * @return The body of the email message to be sent.  If null is returned, no email will be sent.
     */
    public String getMessage();

    /**
     * @return A list of strings that should correspond to 'notification types', which are records in the ehr.notificationtype table.  This
     * is how the list of recipients is identified.
     */
    public Set<String> getNotificationTypes();

    /**
     * @return The string description of this notification
     */
    public String getDescription();

    /**
     * @return The email subject line
     */
    public String getEmailSubject();

    /**
     * @return The last time this task was successfully run.  This includes instances when the task was run, but did not generate an email
     */
    public long getLastRun();

    /**
     * @param ts The last time this notification was run
     */
    public void setLastRun(Long ts);

    /**
     * @param active Toggle the active state of this notification.  Inactive notifications will not attempt to run or send emails.
     */
    public void setActive(Boolean active);

    /**
     * @return True if this notification is active.
     */
    public boolean isActive();
}
