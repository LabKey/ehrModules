/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;

import java.util.ArrayList;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 12:45 PM
 */
public class TaskForm extends AbstractDataEntryForm
{
    protected TaskForm(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
        setJavascriptClass("EHR.panel.TaskDataEntryPanel");

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("Task");
        }
    }

    public static TaskForm createFormPanel(Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new TaskFormSection());
        sections.add(new SimpleFormPanel(schemaName, queryName, label));

        return new TaskForm(owner, queryName, label, category, sections);
    }

    public static TaskForm createGridPanel(Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new TaskFormSection());
        sections.add(new SimpleGridPanel(schemaName, queryName, label));

        return new TaskForm(owner, queryName, label, category, sections);
    }

    public static TaskForm create(Module owner, String category, String name, String label, List<FormSection> formSections)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        sections.add(new TaskFormSection());
        sections.addAll(formSections);

        return new TaskForm(owner, name, label, category, sections);
    }
}
