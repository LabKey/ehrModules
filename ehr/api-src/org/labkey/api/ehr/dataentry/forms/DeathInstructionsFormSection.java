package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormElement;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;

public class DeathInstructionsFormSection extends AbstractFormSection
{
    public DeathInstructionsFormSection()
    {
        super("DeathFormInstructions", "Instructions", "ehr-deathforminstructionspanel");

        addClientDependency(ClientDependency.fromPath("ehr/panel/DeathFormInstructionsPanel.js"));
    }

    @Override
    protected List<FormElement> getFormElements(DataEntryFormContext ctx)
    {
        return Collections.emptyList();
    }
}

