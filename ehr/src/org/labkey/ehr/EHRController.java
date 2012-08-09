/*
 * Copyright (c) 2009-2012 LabKey Corporation
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

package org.labkey.ehr;

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiAction;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.security.*;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.view.HtmlView;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.ehr.notification.Notification;
import org.labkey.ehr.notification.NotificationService;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.text.SimpleDateFormat;
import java.util.Date;

public class EHRController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHRController.class);

    public EHRController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class NotificationAdminAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors) throws Exception
        {
            return new JspView("/org/labkey/ehr/view/notificationAdmin.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild("EHR Notification Admin");
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class NotificationSettingsAction extends ApiAction<NotificationSettingsForm>
    {
        public ApiResponse execute(NotificationSettingsForm form, BindException errors)
        {
            try
            {
                if (form.getReplyEmail() != null)
                    NotificationService.get().setReturnEmail(form.getReplyEmail());

                if (form.getUser() != null)
                    NotificationService.get().setUser(form.getUser());

                if (form.getActive() != null)
                {
                    JSONObject notifications = new JSONObject(form.getActive());
                    for (String name : notifications.keySet())
                    {
                        Notification n = NotificationService.get().getNotification(name);
                        if (n == null)
                        {
                            errors.reject(ERROR_MSG, "Unknown notification: " + name);
                            return null;
                        }

                        n.setActive(notifications.getBoolean(name));
                    }
                }

                if (form.getServiceEnabled() != null)
                    NotificationService.get().setEnabled(form.getServiceEnabled());

            }
            catch (ConfigurationException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
                return null;
            }

            ApiResponse resp = new ApiSimpleResponse();
            resp.getProperties().put("success", true);
            return resp;
        }
    }

    public static class NotificationSettingsForm
    {
        String replyEmail;
        Boolean serviceEnabled;
        String user;
        String active;

        public String getReplyEmail()
        {
            return replyEmail;
        }

        public void setReplyEmail(String replyEmail)
        {
            this.replyEmail = replyEmail;
        }

        public String getUser()
        {
            return user;
        }

        public void setUser(String user)
        {
            this.user = user;
        }

        public String getActive()
        {
            return active;
        }

        public void setActive(String active)
        {
            this.active = active;
        }

        public Boolean getServiceEnabled()
        {
            return serviceEnabled;
        }

        public void setServiceEnabled(Boolean serviceEnabled)
        {
            this.serviceEnabled = serviceEnabled;
        }
    }

    @RequiresPermissionClass(AdminPermission.class)
    public class RunNotificationAction extends SimpleViewAction<RunNotificationForm>
    {
        public ModelAndView getView(RunNotificationForm form, BindException errors) throws Exception
        {
            if (form.getName() == null){
                errors.reject(ERROR_MSG, "No form provided");
                return null;
            }

            if (!NotificationService.get().isEnabled())
            {
                return new HtmlView("The Notification Service is not enabled.  Canot run this report.");
            }

            Notification n = NotificationService.get().getNotification(form.getName());
            if (n == null){
                errors.reject(ERROR_MSG, "Unable to find notification: " + form.getName());
                return null;
            }

            StringBuilder sb = new StringBuilder();
            Date lastRun = new Date(n.getLastRun());
            SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd kk:mm");
            sb.append("The notification email was last run on: " + df.format(lastRun) + "<p>");
            sb.append(n.getMessage());
            return new HtmlView(sb.toString());
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root.addChild("EHR Notification");
        }
    }

    public static class RunNotificationForm
    {
        String _name;

        public String getName()
        {
            return _name;
        }

        public void setName(String name)
        {
            _name = name;
        }
    }

}