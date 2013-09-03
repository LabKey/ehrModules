package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRDataEntryPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class TaskAssignButton extends SimpleButtonConfigFactory
{
    public TaskAssignButton(Module owner)
    {
        super(owner, "Assign Tasks", "EHR.window.TaskAssignWindow.buttonHandler(dataRegionName);");
        setClientDependencies(ClientDependency.fromFilePath("ehr/window/TaskAssignWindow.js"));
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), EHRDataEntryPermission.class);
    }
}

