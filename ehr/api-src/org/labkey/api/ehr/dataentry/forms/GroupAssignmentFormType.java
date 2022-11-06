package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SimpleGridPanel;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class GroupAssignmentFormType extends TaskForm
{
    public GroupAssignmentFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, "animalGroupAssignment", "Animal Group Assignment", "Colony Management", Arrays.<FormSection>asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleGridPanel("study", "animal_group_members", "Group Assignments")
        ));
    }
}
