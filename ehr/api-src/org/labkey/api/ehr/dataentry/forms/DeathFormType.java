package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.ehr.security.EHRCompletedInsertPermission;
import org.labkey.api.ehr.security.EHRSurgeryEntryPermission;
import org.labkey.api.module.Module;

import java.util.Arrays;

public class DeathFormType  extends TaskForm
{
    public static final String NAME = "death";

    public DeathFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Death", "Colony Management", Arrays.asList(
                new DeathInstructionsFormSection(),
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleFormSection("study", "deaths", "Deaths", "ehr-gridpanel")
        ));
    }

    @Override
    protected boolean canInsert()
    {
        if (!getCtx().getContainer().hasPermission(getCtx().getUser(), EHRSurgeryEntryPermission.class))
            return false;

        return EHRService.get().hasPermission("study", "deaths", getCtx().getContainer(), getCtx().getUser(), EHRCompletedInsertPermission.class);
    }
}

