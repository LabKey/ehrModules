package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class ScheduleTaskButton extends SimpleButtonConfigFactory
{
    public ScheduleTaskButton(Module owner, String formType)
    {
        super(owner, "Schedule Task", "EHR.DatasetButtons.compareWeightsHandler(dataRegionName);");
        setClientDependencies(ClientDependency.fromFilePath("ehr/window/CompareWeightsWindow.js"), ClientDependency.fromFilePath("onprc_ehr/buttons.js"));
    }

    public boolean isAvailable(TableInfo ti)
    {
        //this only requires read permission, so the weight table would handle this upstream
        if (ti.getUserSchema().getName().equalsIgnoreCase("study") && ti.getPublicName().equalsIgnoreCase("weight"))
            return true;

        return false;
    }
}

