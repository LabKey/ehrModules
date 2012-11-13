<%
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
%>
<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page import="org.apache.commons.lang3.time.DurationFormatUtils"%>
<%@ page import="org.json.JSONArray" %>
<%@ page import="org.json.JSONObject" %>
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page import="org.labkey.api.util.PageFlowUtil" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.api.view.template.ClientDependency" %>
<%@ page import="org.labkey.ehr.notification.Notification" %>
<%@ page import="org.labkey.ehr.notification.NotificationService" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.LinkedHashSet" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%!

  public LinkedHashSet<ClientDependency> getClientDependencies()
  {
      LinkedHashSet<ClientDependency> resources = new LinkedHashSet<ClientDependency>();
      resources.add(ClientDependency.fromFilePath("Ext4ClientApi"));
      return resources;
  }
%>

<%
    ViewContext context = HttpView.currentContext();
    Container c = context.getContainer();
    User user = context.getUser();
    String renderTarget = "notificationAdmin_1";

    NotificationService ns = NotificationService.get();
    String email = ns.getUser() == null ? null : ns.getUser().getEmail();
    String returnEmail = ns.getReturnEmail() == null ? null : ns.getReturnEmail().toString();
    Boolean serviceEnabled = ns.isEnabled();
    Date date = new Date();
    JSONArray notifications = new JSONArray();
    for (Notification n : ns.getNotifications())
    {
        JSONObject json = new JSONObject();
        json.put("name", n.getName());
        json.put("scheduleDescription", n.getScheduleDescription());
        json.put("lastRun", n.getLastRun());
        json.put("description", n.getDescription());
        json.put("active", n.isActive());

        String duration = n.getLastRun() == 0 ? "" : DurationFormatUtils.formatDurationWords(date.getTime() - n.getLastRun(), true, true);
        json.put("durationString", duration);
        notifications.put(json);
    }
%>

<script type="text/javascript">
    Ext4.onReady(function(){
        var notifications = <%=notifications%>;

        var notificationItems = [];
        for (var i=0;i<notifications.length;i++){
            var notification = notifications[i];
            var timeSince = notification.lastRun == 0 ? null : ((new Date()) - notification.lastRun) / (1000 * 60);


            notificationItems.push({
                layout: 'hbox',
                border: false,
                bodyStyle: 'padding-bottom: 10px;',
                defaults: {
                    border: false,
                    style: 'padding: 5px;'
                },
                itemId: notification.name,
                items: [{
                    html: notification.name,
                    width: 200
                },{
                    width: 350,
                    html: ['Schedule: ' + notification.scheduleDescription,
                        'Last Run: ' + (notification.lastRun == 0 ? 'Never' : new Date(notification.lastRun).format('Y-m-d H:i')),
                        'Time Since: ' + notification.durationString,
                        'Description: ' + notification.description
                    ].join('<br>')
                },{
                    xtype: 'combo',
                    editable: false,
                    width: 120,
                    style:'margin: 5px;',
                    displayField: 'status',
                    valueField: 'status',
                    store: Ext4.create('Ext.data.ArrayStore', {
                        fields: ['status', 'rawValue'],
                        data: [
                            ['Enabled', true],
                            ['Disabled', false]
                        ]
                    }),
                    dataIndex: 'active',
                    notification: notification.name,
                    disabled: !<%=serviceEnabled%>,
                    value: notification.active ? 'Enabled' : 'Disabled'
                },{
                    xtype: 'labkey-linkbutton',
                    text: 'Run Report',
                    target: '_self',
                    linkCls: 'labkey-text-link',
                    href: LABKEY.ActionURL.buildURL('ehr', 'runNotification', null, {name: notification.name})
                }]
            })
        }

        Ext4.QuickTips.init();
        Ext4.create('Ext.form.Panel', {
            title: 'EHR Notifications',
            //width: 520,
            bodyStyle: 'padding: 5px;',
            fieldDefaults: {
                labelWidth: 140,
                width: 400
            },
            items: [{
                xtype: 'combo',
                fieldLabel: 'Service Enabled',
                editable: false,
                helpPopup: 'This is a toggle to turn the service on or off site-wide.  It will automatically be turned off it necessary configuration parameters are not set.',
                dataIndex: 'serviceEnabled',
                allowBlank: false,
                displayField: 'status',
                valueField: 'status',
                store: Ext4.create('Ext.data.ArrayStore', {
                    fields: ['status', 'rawValue'],
                    data: [
                        ['Enabled', true],
                        ['Disabled', false]
                    ]
                }),
                value: <%=serviceEnabled%> ? 'Enabled' : 'Disabled',
                listeners: {
                    change: function(field, val){
                        var disabled = val === 'Disabled'
                        var form = field.up('form');
                        form.getForm().getFields().each(function(field){
                            if(field.dataIndex == 'active')
                                field.setDisabled(disabled);
                        }, this);
                    }
                }
            },{
                xtype: 'textfield',
                fieldLabel: 'Notification User',
                allowBlank: false,
                helpPopup: 'This is the LabKey user that will be used to execute queries and send the emails.  It must be an admin user in the folder holding the EHR study.',
                dataIndex: 'user',
                vtype: 'email',
                value: <%=PageFlowUtil.jsString(email)%>
            },{
                xtype: 'textfield',
                fieldLabel: 'Reply Email',
                allowBlank: false,
                helpPopup: 'This will be used as the reply email for all sent messages.',
                dataIndex: 'replyEmail',
                vtype: 'email',
                value: <%=PageFlowUtil.jsString(returnEmail)%>
            },{
                html: '<b>Notifications:</b>',
                style: 'padding-bottom: 5px;',
                border: false
            },{
                xtype: 'panel',
                itemId: 'notificationSection',
                border: true,
                items: notificationItems
            }],
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'bottom',
                ui: 'footer',
                style: 'background: transparent;',
                items: [{
                    text: 'Save',
                    formBind: true,
                    handler: function(btn){
                        var form = btn.up('form');
                        var obj = {};
                        form.getForm().getFields().each(function(f){
                            if(f.dataIndex == 'active'){
                                obj.active = obj.active || {};
                                var value = f.getValue() == 'Enabled' ? true : false;
                                obj.active[f.notification] = value;
                            }
                            else if (f.dataIndex == 'serviceEnabled'){
                                var value = f.getValue() == 'Enabled' ? true : false;
                                obj[f.dataIndex] = value;
                            }
                            else {
                                obj[f.dataIndex] = f.getValue();
                            }
                        }, this);

                        if (!LABKEY.Utils.isEmptyObj(obj)){
                            if(obj.active){
                                obj.active = Ext4.JSON.encode(obj.active);
                            }
                            Ext4.Ajax.request({
                                url: LABKEY.ActionURL.buildURL('ehr', 'notificationSettings'),
                                params: obj,
                                scope: this,
                                success: function(response){
                                    form.getForm().getFields().each(function(f){
                                        f.resetOriginalValue();
                                    }, this);

                                    Ext4.Msg.alert('Success', 'Save Complete');
                                },
                                failure: LABKEY.Utils.displayAjaxErrorResponse
                            })
                        }
                        else
                            alert('No changes, nothing to save');
                    }
                },{
                    text: 'Cancel',
                    handler: function(btn){
                        window.location = LABKEY.ActionURL.buildURL('project', 'start');
                    }
                }]
            }]
        }).render(<%=PageFlowUtil.jsString(renderTarget)%>);
    });
</script>
<div id="<%=renderTarget%>"></div>