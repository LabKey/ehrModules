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
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.security.EHRHousingTransferPermission;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;

public class HousingFormType extends TaskForm
{
    public static final String NAME = "housing";

    public HousingFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Housing Transfers", "Colony Management", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new HousingFormSection("study", "housing", "Housing Transfers")
        ));

        addClientDependency(ClientDependency.fromPath("ehr/panel/HousingDataEntryPanel.js"));
        setJavascriptClass("EHR.panel.HousingDataEntryPanel");
    }

    @Override
    protected boolean canInsert()
    {
        if (!getCtx().getContainer().hasPermission(getCtx().getUser(), EHRHousingTransferPermission.class))
            return false;

        return super.canInsert();
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
}
