package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class ArrivalFormType extends TaskForm
{
    public static final String NAME = "arrival";

    public ArrivalFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Arrival", "Colony Management", Arrays.asList(
                new LockAnimalsFormSection(),
                new ArrivalInstructionsFormSection(),
                new TaskFormSection(),
                new DocumentArchiveFormSection(),
                new AnimalDetailsFormSection(),
                new NewAnimalFormSection("study", "arrival", "Arrivals", false),
                new WeightFormSection()
        ));

    }
}
