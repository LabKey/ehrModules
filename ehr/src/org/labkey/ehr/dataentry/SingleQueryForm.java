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

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SingleQueryFormSection;
import org.labkey.api.ehr.security.EHRInProgressInsertPermission;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.view.template.ClientDependency;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 12:45 PM
 */
public class SingleQueryForm extends AbstractDataEntryForm
{
    private TableInfo _table;

    private SingleQueryForm(Module owner, String name, String label, String category, TableInfo ti, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
        setJavascriptClass("EHR.panel.SimpleDataEntryPanel");

        _table = ti;

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("SingleQuery");
        }

        addClientDependency(ClientDependency.fromFilePath("ehr/model/sources/SingleQuery.js"));
    }

    public static SingleQueryForm create(Module owner, TableInfo ti)
    {
        List<FormSection> sections = new ArrayList<>();
        sections.add(new SingleQueryFormSection(ti.getPublicSchemaName(), ti.getPublicName(), ti.getTitle()));

        return new SingleQueryForm(owner, ti.getPublicName(), ti.getTitle(), "Custom", ti, sections);
    }

    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = super.toJSON(c, u);
        json.put("pkCols", _table.getPkColumnNames());

        return json;
    }


    @Override
    protected List<String> getButtonConfigs()
    {
        return Collections.singletonList("BASICSUBMIT");
    }

    @Override
    protected List<String> getMoreActionButtonConfigs()
    {
        return Collections.emptyList();
    }
}
