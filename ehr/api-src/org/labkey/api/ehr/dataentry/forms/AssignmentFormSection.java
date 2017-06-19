package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

import java.util.List;

public class AssignmentFormSection extends SimpleFormSection
{
    public AssignmentFormSection()
    {
        super("study", "assignment", "Assignments","ehr-gridpanel");

        setClientStoreClass("EHR.data.AssignmentClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/AssignmentClientStore.js"));
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();

        int idx = defaultButtons.indexOf("DELETERECORD");
        assert idx > -1;
        defaultButtons.add(idx+1, "SET_ASSIGNMENT_DEFAULTS");

        return defaultButtons;
    }
}

