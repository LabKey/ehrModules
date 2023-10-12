package org.labkey.ehr_app.dataentry.form;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.dataentry.forms.BirthFormType;
import org.labkey.api.ehr.dataentry.forms.BirthInstructionsFormSection;
import org.labkey.api.ehr.dataentry.forms.LockAnimalsFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class EHRAppBirthFormType extends BirthFormType
{
    public EHRAppBirthFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, Arrays.asList(
                new LockAnimalsFormSection(),
                new BirthInstructionsFormSection(),
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleFormSection("study", "birth", "Births", "ehr-gridpanel")
        ));
    }
}
