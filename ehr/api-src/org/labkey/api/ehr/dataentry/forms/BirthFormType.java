/*
 * Copyright (c) 2017 LabKey Corporation
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
package org.labkey.api.ehr.dataentry.forms;

import org.json.JSONObject;
import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class BirthFormType  extends TaskForm
{
    public static final String NAME = "birth";

    public BirthFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Birth", "Colony Management", Arrays.asList(
                new LockAnimalsFormSection(),
                new BirthInstructionsFormSection(),
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new NewAnimalFormSection("study", "birth", "Births", false)
        ));
        //Added 2-23-2016:
        for (FormSection s : this.getFormSections())
        {
            s.addConfigSource("Birth_Entry");
        }
        addClientDependency(ClientDependency.fromPath("ehr/model/sources/Birth_Entry.js"));

        setDisplayReviewRequired(true);

    }


    @Override
    public JSONObject toJSON()
    {
        JSONObject ret = super.toJSON();

        //this form involves extra work on save, so relax warning thresholds to reduce error logging
        ret.put("perRowWarningThreshold", 0.5);
        ret.put("totalTransactionWarningThrehsold", 60);
        ret.put("perRowValidationWarningThrehsold", 6);
        ret.put("totalValidationTransactionWarningThrehsold", 60);

        return ret;
    }

    /*@Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();

        // Replace the standard submit
        int idx = ret.indexOf("CLOSE");

        assert idx > -1;
        ret.remove("CLOSE");
        if (idx > -1)
            ret.add(idx, "BIRTH_CLOSE");
        else
            ret.add("BIRTH_CLOSE");

        return ret;
    }
*/

    @Override
    protected List<String> getButtonConfigs()
    {
        List<String> ret = super.getButtonConfigs();

        List<String> defaultButtons = new ArrayList<String>();
        defaultButtons.add("SAVEDRAFT");
        defaultButtons.add("BIRTHARRIVALCLOSE");
        defaultButtons.add("BIRTHARRIVALREVIEW");
        defaultButtons.add("BIRTHARRIVALRELOAD");
        defaultButtons.add("BIRTHARRIVALFINAL");

        return defaultButtons;
    }

}

