package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.DeletePermission;

/**
 * User: bimber
 * Date: 8/21/13
 * Time: 7:09 PM
 */
public class DuplicateTaskButton extends SimpleButtonConfigFactory
{
    public DuplicateTaskButton(Module owner)
    {
        super(owner, "Discard Tasks", "EHR.DatasetButtons.duplicateTaskHandler(dataRegion);");


    }

    public boolean isAvailable(TableInfo ti)
    {
        if (ti.getUserSchema().getName().equalsIgnoreCase("ehr") && ti.getPublicName().equalsIgnoreCase("tasks"))
        {
            return ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), DeletePermission.class);
        }

        return false;
    }
}
