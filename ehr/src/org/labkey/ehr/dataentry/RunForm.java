package org.labkey.ehr.dataentry;

import org.labkey.api.ehr.dataentry.AnimalDetailsFormSection;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.ehr.dataentry.TaskForm;
import org.labkey.api.ehr.dataentry.TaskFormSection;
import org.labkey.api.module.Module;

import java.util.ArrayList;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 12:45 PM
 */
public class RunForm extends TaskForm
{
    protected RunForm(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
        setStoreCollectionClass("EHR.data.RunStoreCollection");
    }

    public static RunForm create(Module owner, String category, String name, String label, List<FormSection> formSections)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        sections.add(new TaskFormSection());
        sections.add(new SimpleGridPanel("study", "Clinpath Runs", "Panels / Services"));
        sections.add(new AnimalDetailsFormSection());
        sections.addAll(formSections);

        return new RunForm(owner, name, label, category, sections);
    }
}
