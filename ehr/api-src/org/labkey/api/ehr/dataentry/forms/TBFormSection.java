package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

public class TBFormSection extends SimpleFormSection
{
    public TBFormSection()
    {
        super("study", "tb", "TB Tests","ehr-gridpanel");

        addClientDependency(ClientDependency.fromPath("ehr/model/sources/TBProcedure.js"));
        addConfigSource("TBProcedure");
    }

}
