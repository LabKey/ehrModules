package org.labkey.ehr_app.dataentry.form;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.dataentry.WeightFormSection;
import org.labkey.api.ehr.dataentry.forms.ArrivalFormType;
import org.labkey.api.ehr.dataentry.forms.ArrivalInstructionsFormSection;
import org.labkey.api.ehr.dataentry.forms.LockAnimalsFormSection;
import org.labkey.api.ehr.dataentry.forms.NewAnimalFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class EHRAppArrivalFormType extends ArrivalFormType
{
    public EHRAppArrivalFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, Arrays.asList(
                new LockAnimalsFormSection(),
                new ArrivalInstructionsFormSection(),
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new NewAnimalFormSection("study", "arrival", "Arrivals", false),
                new WeightFormSection()
        ));
    }
}
