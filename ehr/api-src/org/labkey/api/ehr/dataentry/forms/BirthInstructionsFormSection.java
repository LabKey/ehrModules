package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormElement;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;

public class BirthInstructionsFormSection extends AbstractFormSection
{
    public BirthInstructionsFormSection()
    {
        super("BirthInstructions", "Instructions", "ehr-birthinstructionspanel");

        addClientDependency(ClientDependency.fromPath("ehr/panel/BirthInstructionsPanel.js"));
    }

    @Override
    protected List<FormElement> getFormElements(DataEntryFormContext ctx)
    {
        return Collections.emptyList();
    }
}