package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

public class AliasFormSection extends SimpleFormSection
{
    public AliasFormSection()
    {
        super("study", "alias", "Aliases","ehr-gridpanel");

        addClientDependency(ClientDependency.supplierFromPath("ehr/model/sources/Alias.js"));
        addConfigSource("Alias");
    }
}
