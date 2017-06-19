package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.ehr.dataentry.DataEntryFormContext;
import org.labkey.api.ehr.dataentry.FormElement;
import org.labkey.api.view.template.ClientDependency;

import java.util.Collections;
import java.util.List;

public class LockAnimalsFormSection extends AbstractFormSection
{
    public LockAnimalsFormSection()
    {
        super("LockAnimals", "Lock Animal Creation", "ehr-lockanimalspanel");

        addClientDependency(ClientDependency.fromPath("ehr/panel/LockAnimalsPanel.js"));
    }

    @Override
    protected List<FormElement> getFormElements(DataEntryFormContext ctx)
    {
        return Collections.emptyList();
    }
}
