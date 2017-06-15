package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;

public class WeightFormType extends TaskForm
{
    public static final String NAME = "weight";

    public WeightFormType(DataEntryFormContext ctx, Module owner)
    {
        super(ctx, owner, NAME, "Weights", "Clinical", Arrays.asList(
                new TaskFormSection(),
                new AnimalDetailsFormSection()
                ,
                new WeightFormSection(),
                new DrugAdministrationFormSection(),
                new TBFormSection()
        ));

        addClientDependency(ClientDependency.fromPath("ehr/model/sources/Weight.js"));

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("Task");
            s.addConfigSource("Weight");
        }
    }

}
