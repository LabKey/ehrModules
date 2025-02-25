<%
/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
<%@ page import="org.labkey.api.security.Group" %>
<%@ page import="org.labkey.api.security.SecurityPolicy" %>
<%@ page import="org.labkey.api.security.SecurityPolicyManager" %>
<%@ page import="org.labkey.api.security.roles.Role" %>
<%@ page import="org.labkey.api.snd.Category" %>
<%@ page import="org.labkey.api.snd.SNDService" %>
<%@ page import="org.labkey.snd.SNDController.AdminAction" %>
<%@ page import="org.labkey.snd.SNDController.CategorySecurityAction" %>
<%@ page import="org.labkey.snd.security.SNDSecurityManager" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.Map" %>
<%@ page import="java.util.Objects" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>

<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>

<%!
    String groupName(Group g)
    {
        if (g.getUserId() == Group.groupUsers)
            return "All site users";
        else
            return g.getName();
    }

    String getTooltip(Category cat, Group group)
    {
        return "Category: " + cat.getDescription() + ", Group: " + groupName(group);
    }
%>

<%
    List<Group> groups = org.labkey.api.security.SecurityManager.getGroups(getContainer().getProject(), true);
    ArrayList<Group> validGroups = new ArrayList<>();
    SNDService sndService = SNDService.get();
    SNDSecurityManager sndSecurityManager = SNDSecurityManager.get();

    for (Group g : groups)
    {
        if (g.getUserId() == Group.groupAdministrators || g.getUserId() == Group.groupDevelopers)
            continue;

        validGroups.add(g);
    }

    Map<Integer, Category> categories = sndService.getAllCategories(getContainer(), getUser());
    Map<String, Role> roles = sndSecurityManager.getAllSecurityRoles();

    Map<Integer, Map<Integer, String>> roleMapping = new HashMap<>();
    Map<Integer, String> roleNameMap;
    SecurityPolicy policy;
    List<Role> policyRoles;
    String currentRoleName;
    for (Category category : categories.values())
    {
        roleNameMap = new HashMap<>();
        for (Group gr : validGroups)
        {
            policy = SecurityPolicyManager.getPolicy(category);
            policyRoles = policy.getAssignedRoles(gr);
            if (!policyRoles.isEmpty())
            {
                currentRoleName = null;
                for (Role policyRole : policyRoles)
                {
                    if (roles.containsKey(policyRole.getName()))
                    {
                        currentRoleName = policyRole.getName();
                        break;
                    }
                }

                roleNameMap.put(gr.getUserId(), Objects.requireNonNullElse(currentRoleName, "None"));
            }
            else
            {
                roleNameMap.put(gr.getUserId(), "None");
            }
        }
        roleMapping.put(category.getCategoryId(), roleNameMap);
    }


%>
<style type="text/css">
    .input-append .btn.dropdown-toggle {
        float: none;
    }

    .input-role {
        width: 95%;
        min-width: 140px;
        border: 0;
        text-align: center;
        font-size: 14px;
        font-weight: normal;
        margin-top: 1px;
        cursor: pointer !important;
        background: transparent !important;
    }

    .group-hdr {
        white-space: nowrap;
        text-align: center;
    }

    .category-title {
        white-space: nowrap;
        min-width: 150px;
    }

    .dropdown-selection {
        white-space: nowrap;
        padding: 0 !important;
        margin: 0;
    }

    .btn-role {
        height: 30px;
        width: 100%;
    }

    .btn-group {
        width: 100%;
    }
</style>

<script type="text/javascript" nonce="<%=getScriptNonce()%>">

    function setRole(group, category, role) {
        document.getElementById(group + '_' + category).value = role;
    }

    function clearAll() {
        if (window.confirm("This will clear all roles. Clear All?")) {

            var els = document.querySelectorAll(".input-role:not(.input-all)");
            for (var key in els) {
                if (els.hasOwnProperty(key)) {
                    els[key].value = "None";
                }
            }
        }
    }

    function setAllInGroup(group, value) {
        var elements = document.querySelectorAll('input[id^="' + group + '"]');
        for (var i=0; i < elements.length; i++)
        {
            elements[i].value = value;
        }
    }

</script>
<labkey:panel title="Category Security">

    <labkey:form id="categorySecurityForm" action="<%=urlFor(CategorySecurityAction.class)%>" method="POST">

        <table class="table table-striped table-bordered table-hover roles-table" id="category-security">
            <thead id="groups-hdr">
                <tr>
                    <th> </th>
                    <%
                        for (Group g : validGroups)
                        {
                    %>
                            <th class="group-hdr"><%=h(groupName(g))%></th>
                    <%
                        }
                    %>
                </tr>
            </thead>
            <tbody>
                <td class="category-title">All Categories</td>
                <%
                    int id = 1;
                    for (Group g : validGroups)
                    {
                %>
                        <td class="dropdown-selection" data-toggle="tooltip" title='Set all roles for group'><div class="input-append btn-group" data-toggle="dropdown">
                            <a class="btn dropdown-toggle btn-role" data-toggle="dropdown" href="#" id="<%=h("a_all_" + g.getUserId())%>">
                                <input class="input-role input-all" id="<%=h("all_" + g.getUserId())%>" type="text" value='' readonly>
                                <span class="caret"></span></a>
                                <ul class="dropdown-menu">
                                    <li>
                                        <% addHandler("setAllInGroup" + id, "click", "return setAllInGroup(" + g.getUserId() + ", 'None')"); %>
                                        <a id='setAllInGroup<%=id++%>'>None</a>
                                    </li>
                                    <% for (Role role : roles.values()) {
                                        addHandler("setAllInGroup" + id, "click", "return setAllInGroup(" + g.getUserId() + ", " + q(role.getName()) + ")");
                                    %><li>
                                        <a id='setAllInGroup<%=id++%>'><%=h(role.getName())%></a>
                                </li><%
                                }
                            %></ul></div></td>
                <%
                    }
                %>
                <%
                    String name;
                    for (Category category : categories.values())
                    {
                %>      <tr><td class="category-title"><%=h(category.getDescription())%></td>
                        <% for (Group group : validGroups) {
                            name = group.getUserId() + "_" + category.getCategoryId();
                            %><td class="dropdown-selection" data-toggle="tooltip" title='<%=h(getTooltip(category, group))%>'><div class="input-append btn-group" data-toggle="dropdown">
                                <a class="btn dropdown-toggle btn-role" data-toggle="dropdown" href="#">
                                    <input class="input-role" id="<%=h(name)%>" name="<%=h("group_category|" + name)%>" type="text"
                                           value='<%=h(roleMapping.get(category.getCategoryId()).get(group.getUserId()))%>' readonly>
                                    <span class="caret"></span></a>
                                <ul class="dropdown-menu">
                                    <li>
                                        <% addHandler("setRole" + id, "click", "return setRole(" + group.getUserId() + ", " + category.getCategoryId() + ", 'None')"); %>
                                        <a id='setRole<%=id++%>'>None</a>
                                    </li>
                                <% for (Role role : roles.values()) {
                                    addHandler("setRole" + id, "click", "return setRole(" + group.getUserId() + ", " + category.getCategoryId() + ", " + q(role.getName()) + ")");
                                    %><li>
                                        <a id='setRole<%=id++%>'><%=h(role.getName())%></a>
                                    </li><%
                                }
                                %></ul></div></td><%
                        }
                        %></tr><%
                    }
                %>
            </tbody>
        </table>

        <%= button("Save").submit(true) %>
        <%= button("Clear All").href("#").onClick("return clearAll();") %>
        <%= button("Cancel").href(urlFor(AdminAction.class)) %>

    </labkey:form>

</labkey:panel>