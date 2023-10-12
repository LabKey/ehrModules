package org.labkey.ehr_app.dataentry.form;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.dataentry.forms.DeathFormType;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class EHRAppDeathFormType extends DeathFormType
{

    public EHRAppDeathFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleFormSection("study", "deaths", "Deaths", "ehr-gridpanel")
        ));
    }
}
