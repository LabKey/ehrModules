package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.buttons.EHRShowEditUIButton;
import org.labkey.api.ehr.security.EHRLocationEditPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.template.ClientDependency;

import java.util.Arrays;
import java.util.LinkedHashSet;

/**

 */
public class CageBulkEditButton extends SimpleButtonConfigFactory
{
    public CageBulkEditButton(Module owner)
    {
        super(owner, "Bulk Edit Cage/Divider Types", "EHR.window.BulkEditCageTypeWindow.buttonHandler(dataRegionName);");

        LinkedHashSet cds = new LinkedHashSet<ClientDependency>();
        cds.add(ClientDependency.fromModuleName("ehr"));
        cds.add(ClientDependency.fromFilePath("ehr/window/BulkEditCageTypeWindow.js"));
        setClientDependencies(cds);
    }

    @Override
    public boolean isAvailable(TableInfo ti)
    {
        if (!super.isAvailable(ti))
            return false;

        if (!ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), EHRLocationEditPermission.class))
            return false;

        return true;
    }
}
