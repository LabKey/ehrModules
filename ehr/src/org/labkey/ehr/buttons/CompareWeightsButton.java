package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.study.DataSetTable;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class CompareWeightsButton extends SimpleButtonConfigFactory
{
    public CompareWeightsButton(Module owner)
    {
        super(owner, "Compare Weights", "EHR.DatasetButtons.compareWeightsHandler(dataRegionName);");
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

