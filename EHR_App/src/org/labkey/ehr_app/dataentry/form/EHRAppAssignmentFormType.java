package org.labkey.ehr_app.dataentry.form;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.dataentry.forms.AssignmentFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class EHRAppAssignmentFormType extends TaskForm
{
    public static final String NAME = "assignment";

    public EHRAppAssignmentFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Project Assignment", "Projects and Protocols", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new AssignmentFormSection()
        ));
    }
}
