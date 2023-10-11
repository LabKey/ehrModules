package org.labkey.ehr_app.dataentry.form;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.Arrays;
import java.util.List;

public class EHRAppHousingFormType extends TaskForm
{
    public static final String NAME = "housing";

    public EHRAppHousingFormType(DataEntryFormContext ctx, Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(ctx, owner, NAME, "Housing Transfers", "Colony Management", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection(),
                new SimpleFormSection("study", "housing", "Housing Transfers", "ehr-gridpanel")
        ));
    }
}
