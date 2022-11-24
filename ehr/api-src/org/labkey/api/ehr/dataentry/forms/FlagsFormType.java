package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleGridPanel;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class FlagsFormType extends TaskForm
{
    public static final String NAME = "flags";

    public FlagsFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Flags", "Colony Management", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleGridPanel("study", "flags", "Flags")
        ));
    }
}
