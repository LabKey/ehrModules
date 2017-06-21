package org.labkey.api.ehr.dataentry.forms;

import org.labkey.api.ehr.EHRService;

import java.util.List;

public class TreatmentOrdersFormSection extends DrugAdministrationFormSection
{
    public TreatmentOrdersFormSection()
    {
        this(EHRService.FORM_SECTION_LOCATION.Body);
    }

    public TreatmentOrdersFormSection(EHRService.FORM_SECTION_LOCATION location)
    {
        super(location);
        setName("Treatment Orders");
        setLabel("Medication/Treatment Orders");
        setQueryName("Treatment Orders");
        _showAddTreatments = false;
    }

    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();
        defaultButtons.remove("SEDATIONHELPER");

        return defaultButtons;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.remove("REPEAT_SELECTED");

        return defaultButtons;
    }
}

