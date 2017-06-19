package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;

public class AssignmentFormType extends TaskForm
{
    public static final String NAME = "assignment";

    public AssignmentFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Project Assignment", "Colony Management", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new AssignmentFormSection()
        ));

        for (FormSection s : this.getFormSections())
        {
            s.addConfigSource("ProjectAnimalConditions");
        }
    }
}
