package org.labkey.ehr.notification;

import org.apache.log4j.Logger;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.Group;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.settings.AppProps;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.MailHelper;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.EHRSchema;

import javax.mail.Address;
import javax.mail.Message;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 7/23/12
 * Time: 7:22 PM
 */

abstract public class AbstractNotification implements Notification, Runnable
{
    protected final static Logger log = Logger.getLogger(Notification.class);
    protected UserSchema _studySchema;
    protected UserSchema _ehrSchema;
    protected Container _ehrContainer;
    protected Study _ehrStudy;
    protected String _baseUrl;


    protected final static SimpleDateFormat _dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd kk:mm");
    protected final static SimpleDateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
    protected final static SimpleDateFormat _timeFormat = new SimpleDateFormat("kk:mm");
    protected NotificationService _ns = NotificationService.get();
    protected List<ScheduledFuture> _futureTasks = new ArrayList<ScheduledFuture>();
    protected int _startDelay = 0;//(1000 * 5); //5 minutes

    //NOTE: do not attempt to cache these between runs in case a setting changes
    protected void init()
    {
        User u = _ns.getUser();
        ModuleProperty mp = ModuleLoader.getInstance().getModule("EHR").getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String c = mp.getEffectiveValue(u, ContainerManager.getRoot());
        if(c == null)
            throw new ConfigurationException("Module property EHRStudyContainer not set");

        _ehrContainer = ContainerManager.getForPath(c);
        if(_ehrContainer == null)
            throw new ConfigurationException("Container not found for EHR: " + c);
        _baseUrl = AppProps.getInstance().getBaseServerUrl() + AppProps.getInstance().getContextPath() + "/query" + _ehrContainer.getPath();

        _ehrStudy = StudyService.get().getStudy(_ehrContainer);
        if(_ehrStudy == null)
            throw new ConfigurationException("No study found in container: " + _ehrContainer.getPath());

        _studySchema = QueryService.get().getUserSchema(u, _ehrContainer, "study");
        if(_studySchema == null)
            throw new ConfigurationException("Unable to find schema for study in container: " + _ehrContainer.getPath());

        _ehrSchema = QueryService.get().getUserSchema(u, _ehrContainer, "ehr");
        if(_ehrSchema == null)
            throw new ConfigurationException("Unable to find schema for ehr in container: " + _ehrContainer.getPath());
    }

    public synchronized void start()
    {
        if (!isActive())
        {
            log.info("Notification " + getName() + " is not active, will not start.");
            return;
        }

        if (_futureTasks.size() > 0)
        {
            log.info("Notification " + getName() + " already has active tasks, will not restart.");
            return;
        }

        log.info("Scheduling notification " + getName() + " to run with schedule: " + getScheduleDescription());
        _futureTasks = schedule(_startDelay);
    }

    public void stop()
    {
        if (_futureTasks.size() == 0)
        {
            log.info("Could not stop notification " + getName() + " because it has no active tasks.");
        }
        else
        {
            log.info("Shutting down notification " + getName());
            for (ScheduledFuture ft : _futureTasks)
            {
                boolean isCancelled = ft.cancel(false);
            }
        }
    }

    public void run()
    {
        log.info("Trying to run notification: " + getName());

        if (isActive())
        {
            init();

            //find recipients
            final Set<UserPrincipal> recipients = new HashSet<UserPrincipal>();
            TableInfo t = EHRSchema.getInstance().getSchema().getTable("notificationrecipients");
            SimpleFilter filter = new SimpleFilter("notificationtype", getNotificationTypes(), CompareType.IN);
            TableSelector ts = new TableSelector(t, Collections.singleton("recipient"), filter, null);
            if (ts.getRowCount() > 0)
            {
                ts.forEach(new TableSelector.ForEachBlock<ResultSet>(){
                    public void exec(ResultSet rs) throws SQLException
                    {
                        int userId = rs.getInt("recipient");
                        UserPrincipal u = org.labkey.api.security.SecurityManager.getPrincipal(userId);
                        recipients.add(u);
                    }
                });
            }

            if (recipients.size() == 0)
            {
                log.info("Notification: " + getName() + " has no recipients, skipping");
                return;
            }

            try
            {
                String msg = getMessage();
                if (StringUtils.isEmpty(msg))
                {
                    log.info("Notification " + getName() + " did not produce a message, will not send email");
                    setLastRun(new Date().getTime());
                    return;
                }

                log.info("Sending message for notification: " + getName() + " to " + recipients.size() + " recipients");
                MailHelper.MultipartMessage mail = MailHelper.createMultipartMessage();

                mail.setFrom(_ns.getReturnEmail());
                mail.setSubject(getEmailSubject());
                mail.setBodyContent(msg, "text/html");

                for (UserPrincipal u : recipients)
                {
                    mail.addRecipients(Message.RecipientType.TO, getEmails(u.getUserId()));
                }

                //TODO
                //MailHelper.send(mail, _ns.getUser(), _ehrContainer);
                setLastRun(new Date().getTime());
            }
            catch (Exception e)
            {
                throw new RuntimeException(e);
            }
        }
        else
        {
            log.info("Notification " + getName() + " is not active, skipping");
        }
    }

    private Address[] getEmails(int principalId) throws ValidEmail.InvalidEmailException
    {
        UserPrincipal user = SecurityManager.getPrincipal(principalId);
        if (user instanceof User)
        {
            ValidEmail validEmail = new ValidEmail(((User)user).getEmail());
            return new Address[]{validEmail.getAddress()};
        }
        else
        {
            Group group = ((Group)user);
            if (group != null)
            {
                if (group.isSystemGroup())
                    throw new IllegalArgumentException("Invalid group ID: site groups are not allowed");

                List<User> members = SecurityManager.getGroupMembers(group);
                List<Address> addresses = new ArrayList<Address>();
                for (User u : members)
                {
                    ValidEmail validEmail = new ValidEmail(u.getEmail());
                    addresses.add(validEmail.getAddress());
                }
                return addresses.toArray(new Address[members.size()]);
            }
            else
                throw new IllegalArgumentException("Unable to resolve principalId");
        }
    }

    public long getLastRun()
    {
        Map<String, String> m = PropertyManager.getProperties(NotificationService.TIMESTAMP_PROPERTY_DOMAIN);
        String value = m.get(getName());
        if (value != null)
        {
            return Long.parseLong(value);
        }
        return 0;
    }

    public void setLastRun(Long ts)
    {
        log.info(String.format("Setting new baseline timestamp of %s on notification %s", new Date(ts.longValue()).toString(), getName()));
        PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(NotificationService.TIMESTAMP_PROPERTY_DOMAIN, true);
        pm.put(getName(), ts.toString());
        PropertyManager.saveProperties(pm);
    }

    public void setActive(Boolean active)
    {
        log.info(String.format("Setting notification %s to an active state of %s", getName(), active.toString()));
        PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(NotificationService.STATUS_PROPERTY_DOMAIN, true);
        pm.put(getName(), active.toString());
        PropertyManager.saveProperties(pm);
    }

    public boolean isActive()
    {
        Map<String, String> m = PropertyManager.getProperties(NotificationService.STATUS_PROPERTY_DOMAIN);
        String value = m.get(getName());
        if (value != null)
        {
            return Boolean.parseBoolean(value);
        }
        return true;
    }

    protected String appendField(String name, Results rs) throws SQLException
    {
        return rs.getString(FieldKey.fromString(name)) == null ? "" : rs.getString(FieldKey.fromString(name));
    }
}