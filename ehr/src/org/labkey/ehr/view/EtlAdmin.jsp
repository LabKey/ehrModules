<%
/*
 * Copyright (c) 2010 LabKey Corporation
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

<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.ViewContext"%>
<%@ page import="org.labkey.api.view.ActionURL" %>
<%@ page import="org.labkey.ehr.EHRController" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.text.DateFormat" %>

<%
    ViewContext context = HttpView.currentContext();
    HttpView<EHRController.EtlAdminBean> me = (HttpView<EHRController.EtlAdminBean>) HttpView.currentView();
    EHRController.EtlAdminBean bean = me.getModelBean();
    DateFormat df = DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.SHORT);

%>
<form method="post">

<b>Status:</b>
<select name="etlStatus">
<option
<% if (EHRController.isEtlRunning()) { %>selected<% } %>
>Run</option>
<option
<% if (!EHRController.isEtlRunning()) { %>selected<% } %>
>Stop</option>
</select>

<input type="submit" value="Save All"/>

[<a href="<%= new ActionURL(EHRController.EtlAdminAction.class, context.getContainer()) %>">refresh</a>]

<table>
<tr>
<td valign="top">
<h2>Settings</h2>

<table>
<%
    for (String configKey : bean.getConfigKeys())
    {
%>
    <tr>
    <td><%= configKey %></td>
    <td><input size=50 name="<%= configKey %>" value="<%= bean.getConfig().get(configKey) %>"/></td>
    </tr>
<%
    }
%>

<tr>
<td>shouldAnalyze</td>
<td>
<input type="checkbox" name="shouldAnalyze" <%= bean.shouldAnalyze() ? "checked" : "" %> />
</td>
</tr>

</table>
</td>
<td valign="top">
<h2>Timestamps</h2>
Expected format: "8/4/10 9:22 AM"
<table>
<%
    for (Map.Entry entry : bean.getTimestamps().entrySet())
    {
%>
    <tr>
    <td><%= entry.getKey() %></td>
    <td><input size=20 name="<%=entry.getKey()%>" value="<%= df.format(new Date(Long.parseLong(entry.getValue().toString()))) %>"/></td>
    </tr>
<%
    }
%>
</table>
</td>
</tr>
</table>
<input type="submit" value="Save All"/>
</form>
