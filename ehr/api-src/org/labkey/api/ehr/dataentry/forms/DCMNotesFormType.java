package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class DCMNotesFormType extends TaskForm
{
    public static final String NAME = "notes";

    public DCMNotesFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "DCM Notes", "Colony Management", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleFormSection("study", "notes", "DCM Notes", "ehr-gridpanel")
        ));
    }
}

