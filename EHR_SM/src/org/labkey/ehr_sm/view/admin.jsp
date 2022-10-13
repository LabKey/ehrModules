<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
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
<%@ page import="org.labkey.api.exp.api.ExpSampleType" %>
<%@ page import="org.labkey.api.security.User" %>
<%@ page import="org.labkey.api.util.HtmlString" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.JspView" %>
<%@ page import="org.labkey.ehr_sm.EHR_SMController" %>
<%@ page import="static java.util.Arrays.stream" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspView<EHR_SMController.AdminForm> me = (JspView<EHR_SMController.AdminForm>) HttpView.currentView();
    EHR_SMController.AdminForm form = me.getModelBean();
    Container c = getContainer();
    User user = getUser();
%>

<labkey:errors/>
<labkey:form method="POST">
    <div style="font-weight: bold; margin-bottom: 1em; margin-top: 1em;">
        Sample Received Column
        <%=helpPopup("Sample Received Date Column", "Used for calculation of columns like age at sample time. Must be a date column.")%>
    </div>
    <input
            style="width:300px; margin-bottom: 2em;"
            type="text"
            id="sampleReceivedCol"
            name="sampleReceivedCol"
            value=<%=form.getSampleReceivedCol() != null ? h(form.getSampleReceivedCol()) : h("Created")%>
    />
    <div style="font-weight: bold; margin-bottom: 1em;">
        Animal Sample Types
        <%=helpPopup("Sample Types", "Sample types to include animal data. Must use Animal source.")%>
    </div>
    <table class="lk-fields-table">
        <%
            for (ExpSampleType animalSampleType : form.getAnimalSampleTypes())
            {
                HtmlString typeName = h(animalSampleType.getName());
                boolean isSelected = stream(form.getSelectedAnimalSampleTypes()).anyMatch(s -> s.equals(typeName.toString()));
        %>
                <tr>
                    <td nowrap>
                        <div style="margin-bottom: 1em;">
                            <labkey:checkbox
                                    id="<%=typeName.toString()%>"
                                    name="selectedAnimalSampleTypes"
                                    value="<%=typeName.toString()%>"
                                    checked="<%=isSelected%>"
                            />
                            <label for=<%=typeName%>><%=typeName%></label>
                        </div>
                    </td>
                </tr>
        <%
            }
        %>
    </table>
    <input style="margin-top: 1em;" type="submit" value="Save">
</labkey:form>
