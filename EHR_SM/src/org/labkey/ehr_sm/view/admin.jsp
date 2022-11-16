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
<%@ taglib prefix="labkey" uri="http://www.labkey.org/taglib" %>
<%@ page import="org.labkey.api.exp.api.ExpSampleType" %>
<%@ page import="org.labkey.api.view.HttpView" %>
<%@ page import="org.labkey.api.view.JspView" %>
<%@ page import="org.labkey.ehr_sm.EHR_SMController" %>
<%@ page import="java.util.Set" %>
<%@ page extends="org.labkey.api.jsp.JspBase" %>
<%
    JspView<EHR_SMController.AdminForm> me = (JspView<EHR_SMController.AdminForm>) HttpView.currentView();
    EHR_SMController.AdminForm form = me.getModelBean();
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
            Set<String> selectedTypes = Set.of(form.getSelectedAnimalSampleTypes());
            for (ExpSampleType animalSampleType : form.getAnimalSampleTypes())
            {
                String typeName = animalSampleType.getName();
                boolean isSelected = selectedTypes.contains(typeName);
        %>
                <tr>
                    <td nowrap>
                        <div style="margin-bottom: 1em;">
                            <labkey:checkbox
                                id="<%=typeName%>"
                                name="selectedAnimalSampleTypes"
                                value="<%=typeName%>"
                                checked="<%=isSelected%>"
                            />
                            <label for=<%=h(typeName)%>><%=h(typeName)%></label>
                        </div>
                    </td>
                </tr>
        <%
            }
        %>
    </table>
    <input style="margin-top: 1em;" type="submit" value="Save">
</labkey:form>
