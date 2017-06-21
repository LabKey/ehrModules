package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.ehr.dataentry.SimpleFormSection;
import org.labkey.api.view.template.ClientDependency;

public class HousingFormSection  extends SimpleFormSection
{
    public HousingFormSection(String schema, String query, String label)
    {
        super(schema, query, label, "ehr-gridpanel",EHRService.FORM_SECTION_LOCATION.Body);

        addClientDependency(ClientDependency.fromPath("ehr/window/RoomTransferWindow.js"));
        setClientStoreClass("EHR.data.HousingClientStore");
        addClientDependency(ClientDependency.fromPath("ehr/data/HousingClientStore.js"));
        addClientDependency(ClientDependency.fromPath("ehr/buttons/housingButtons.js"));
        setTemplateMode(AbstractFormSection.TEMPLATE_MODE.NONE);
    }
}

