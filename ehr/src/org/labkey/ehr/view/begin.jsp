<%
/*
 * Copyright (c) 2009-2010 LabKey Corporation
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
<%@ page import="org.labkey.api.data.Container"%>
<%@ page import="org.labkey.api.pipeline.PipeRoot"%>
<%@ page import="org.labkey.api.pipeline.PipelineService" %>
<%@ page import="org.labkey.api.pipeline.PipelineUrls" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page import="org.labkey.api.security.permissions.AdminPermission" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.ViewContext" %>
<%@ page import="org.labkey.ehr.EHRController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    ViewContext context = HttpView.currentContext();
    Container c = context.getContainer();
    User user = context.getUser();

    PipeRoot pipeRoot = PipelineService.get().findPipelineRoot(c);
    ActionURL pipelineSetupURL = urlProvider(PipelineUrls.class).urlSetup(c);
    ActionURL pipelineBeginURL = urlProvider(PipelineUrls.class).urlBegin(c);
    ActionURL etlAdminURL = new ActionURL(EHRController.EtlAdminAction.class, c);

%>
Hello, and welcome to the EHR module.

<% if (c.hasPermission(user, AdminPermission.class)) { %>
<p>
    <% if (pipeRoot == null) { %>
<%=textLink("Setup Pipeline", pipelineSetupURL)%>
    <% } %>
<%=textLink("ETL Administation", etlAdminURL)%>

<%--
<script type="text/javascript">
    var reloadSchemaUrl = "<%=new ActionURL(EHRController.ReloadSchemaAction.class, c)%>";
    var reloadStatusUrl = "<%=new ActionURL(EHRController.ReloadStatusAction.class, c)%>";
    var lastStatus = null;

    var reloadCfg = {url: reloadSchemaUrl, callback: statusCallback, text: ''};
    var statusCfg = {url: reloadStatusUrl, callback: statusCallback, text: ''};

    function reloadSchema() {
        //Ext.Ajax.request({url:reloadSchemaUrl});
        var elt = Ext.get("reloadStatus");
        elt.getUpdater().update(updateCfg);
    }

    function statusCallback(el, success, response, options) {
        if (!success) {
            var o = undefined;
            try {
                o = Ext.decode(response.responseText);
            } catch (e) {
                o = { exception: "Error decoding response: " + e };
            }

            if (lastStatus != o.exception) {
                el.dom.innerHTML = o.exception;
                lastStatus = o.exception;
            }
        }
    }

    function renderStatus(el, response, updater, callback) {
        var o = undefined;
        try {
            o = Ext.decode(response.responseText);
        } catch (e) {
            o = { exception: "Error decoding response: " + e };
        }

        if (lastStatus != o.status) {
            el.dom.innerHTML = o.status;
            lastStatus = o.status;
        }
    }

    function updateStatus() {
        var elt = Ext.get("reloadStatus");
        elt.getUpdater().update(statusCfg);
    }

    Ext.onReady(function () {
        var elt = Ext.get("reloadStatus");
        elt.getUpdater().setRenderer({ render: renderStatus });
        elt.getUpdater().startAutoRefresh(1, statusCfg, null, null, true);
    });

</script>

<p>
<%=textLink("Reload Schema", "#", "reloadSchema(); return false;", "")%>
</p>
<div id="reloadStatus">
</div>

--%>

<% } %>

