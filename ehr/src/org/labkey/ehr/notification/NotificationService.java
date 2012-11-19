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

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.gwt.client.util.StringUtils;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ConfigurationException;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.EHRModule;

import javax.mail.Address;
import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

/**
 * Created by IntelliJ IDEA.
 * User: bbimber
 * Date: 7/14/12
 * Time: 2:49 PM
 */
public class NotificationService
{
    private final static Logger log = Logger.getLogger(EHRModule.class);

    private List<Notification> _notifications = new ArrayList<Notification>();
    private Address _returnEmail;
    private User _user;
    private boolean _enabled;
    public final static String TIMESTAMP_PROPERTY_DOMAIN = "org.labkey.ehr.notifications.timestamp";
    public final static String STATUS_PROPERTY_DOMAIN = "org.labkey.ehr.notifications.status";
    public final static String CONFIG_PROPERTY_DOMAIN = "org.labkey.ehr.notifications.config";
    private final ScheduledExecutorService _executor = Executors.newSingleThreadScheduledExecutor();

    private static final NotificationService _instance = new NotificationService();

    public static NotificationService get()
    {
        return _instance;
    }

    private NotificationService()
    {
    }

    private void initConfiguration() throws ConfigurationException
    {
        //dont throw until the end, so we have the chance to initialize all values
        List<String> errors = new ArrayList<String>();

        String userString = getConfigProperty("labkeyUser");
        if (userString == null)
        {
            errors.add("Missing configuration: labkey user not set");
        }
        else
        {
            _user = UserManager.getUser(Integer.parseInt(userString));
            if (_user == null)
            {
                errors.add("Bad configuration: invalid labkey user");
            }
        }

        String returnEmail = getConfigProperty("returnEmail");
        if (returnEmail == null)
        {
            errors.add("Missing configuration: returnEmail not set");
        }
        else
        {
            setReturnEmail(returnEmail);
        }

        //the following are not cached, but we verify values are available
        ModuleProperty mp = ModuleLoader.getInstance().getModule("EHR").getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        //TODO: multiple containers??
        String c = mp.getEffectiveValue(_user, ContainerManager.getRoot());
        if(c == null)
            errors.add("Module property EHRStudyContainer not set");
        else
        {
            Container ehrContainer = ContainerManager.getForPath(c);
            if(ehrContainer == null)
                errors.add("Container not found for EHR: " + c);
            else
            {
                Study ehrStudy = StudyService.get().getStudy(ehrContainer);
                if(ehrStudy == null)
                    errors.add("No study found in container: " + ehrContainer.getPath());

                UserSchema studySchema = QueryService.get().getUserSchema(_user, ehrContainer, "study");
                if(studySchema == null)
                    errors.add("Unable to find schema for study in container: " + ehrContainer.getPath());

                UserSchema ehrSchema = QueryService.get().getUserSchema(_user, ehrContainer, "ehr");
                if(ehrSchema == null)
                    errors.add("Unable to find schema for ehr in container: " + ehrContainer.getPath());
            }
        }

        if (errors.size() > 0)
        {
            throw new ConfigurationException(StringUtils.join(errors, ";\n"));
        }
    }

    public synchronized void start(int delay)
    {
        new Timer(delay, new ActionListener(){
            public void actionPerformed(ActionEvent evt) {
                doStart();
            }
        });
    }

    public void doStart()
    {
        log.info("Trying to initialize EHR Notification Service");

        _enabled = Boolean.parseBoolean(getConfigProperty("serviceEnabled"));
        try
        {
            //we will still try to cache values for later use
            initConfiguration();

            if (!_enabled)
            {
                log.info("EHR Notification Service is not enabled on this server.  Will not start.");
                return;
            }
        }
        catch (ConfigurationException e)
        {
            if (_enabled)
            {
                _enabled = false;
                log.error(e.getMessage(), e);
            }
            return;
        }

        for (Notification n : _notifications)
        {
            n.start(0);
        }
    }

    public synchronized void stop()
    {
        for (Notification n : _notifications)
        {
            n.stop();
        }
    }

    public void addNotification(Notification notification)
    {
        _notifications.add(notification);
    }

    private static String getConfigProperty(String key)
    {
        return PropertyManager.getProperties(CONFIG_PROPERTY_DOMAIN).get(key);
    }

    public User getUser()
    {
        return _user;
    }

    public List<Notification> getNotifications()
    {
        return _notifications;
    }

    public Address getReturnEmail()
    {
        if (_returnEmail != null)
            return _returnEmail;

        setReturnEmail(getConfigProperty("returnEmail"));
        return _returnEmail;
    }

    public Notification getNotification(String name)
    {
        for (Notification n : _notifications)
        {
            if (n.getName().equals(name))
                return n;
        }
        return null;
    }

    public void setReturnEmail(String returnEmail)
    {
        try
        {
            if(returnEmail != null)
            {
                ValidEmail email = new ValidEmail(returnEmail);

                PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(NotificationService.CONFIG_PROPERTY_DOMAIN, true);
                pm.put("returnEmail", email.getEmailAddress());
                PropertyManager.saveProperties(pm);

                _returnEmail = email.getAddress();
            }
        }
        catch (ValidEmail.InvalidEmailException e)
        {
            throw new ConfigurationException(e.getMessage());
        }
    }

    public void setUser(String email)
    {
        try
        {
            ValidEmail ve = new ValidEmail(email);
            User u = UserManager.getUser(ve);
            if (u == null)
            {
                throw new ConfigurationException("User not found: " + ve.getEmailAddress());
            }

            if (!getStudyContainer().hasPermission(u, AdminPermission.class))
            {
                throw new ConfigurationException("User is not an admin in the EHR study folder");
            }

            Integer id = u.getUserId();
            PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(NotificationService.CONFIG_PROPERTY_DOMAIN, true);
            pm.put("labkeyUser", id.toString());
            PropertyManager.saveProperties(pm);
            _user = u;
        }
        catch (ValidEmail.InvalidEmailException e)
        {
            throw new ConfigurationException(e.getMessage());
        }
    }

    public Container getStudyContainer()
    {
        ModuleProperty mp = ModuleLoader.getInstance().getModule("EHR").getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String c = mp.getEffectiveValue(_user, ContainerManager.getRoot());
        if(c == null)
            return null;

        return ContainerManager.getForPath(c);
    }

    public boolean isEnabled()
    {
        return _enabled;
    }

    public void setEnabled(Boolean enabled)
    {
        PropertyManager.PropertyMap pm = PropertyManager.getWritableProperties(NotificationService.CONFIG_PROPERTY_DOMAIN, true);
        pm.put("serviceEnabled", enabled.toString());
        PropertyManager.saveProperties(pm);

        if (_enabled != enabled)
        {
            _enabled = enabled;
            if (enabled)
                doStart();
            else
                stop();
        }
    }

    public ScheduledExecutorService getExecutor()
    {
        return _executor;
    }
}
