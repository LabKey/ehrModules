<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%
/*
 * Copyright (c) 2022 LabKey Corporation
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
<%@ page import="org.labkey.api.data.Container" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page import="org.labkey.api.security.permissions.AdminPermission" %>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.ehr_sm.EHR_SMController" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    Container c = getContainer();
    User user = getUser();
%>

<div data-name="helloMessage">Hello, and welcome to the EHR Sample Manager module. Please see <%=helpLink("ehrSamples", "documentation")%> for setup and description of the module.</div>
<br>
<a href="<%=h(new ActionURL("sampleManager", "app", getContainer()))%>">Go To Sample Manager</a>
<br>
<% if(c.hasPermission(user, AdminPermission.class)) {%>
    <br>
    <a href="<%=h(new ActionURL(EHR_SMController.AdminAction.class, getContainer()))%>">Admin Page</a>
<% } %>
