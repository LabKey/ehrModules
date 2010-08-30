
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
