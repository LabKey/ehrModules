package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

public class WeightFormSection extends SimpleFormSection
{
     public WeightFormSection()
    {
        super("study", "Weight", "Weights", "ehr-gridpanel");
        setClientStoreClass("EHR.data.WeightClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/WeightClientStore.js"));

        _showLocation = true;
    }
}
