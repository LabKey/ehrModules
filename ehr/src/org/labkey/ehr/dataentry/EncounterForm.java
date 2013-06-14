package org.labkey.ehr.dataentry;

import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;

import java.util.List;

/**
 * User: bimber
 * Date: 6/10/13
 * Time: 7:08 PM
 */
public class EncounterForm extends TaskForm
{
    protected EncounterForm(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
        setJavascriptClass("EHR.panel.EncounterDataEntryPanel");

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("Encounter");
        }
    }
}
