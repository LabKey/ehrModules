<%
/*
 * Copyright (c) 2009-2011 LabKey Corporation
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

<% } %>

