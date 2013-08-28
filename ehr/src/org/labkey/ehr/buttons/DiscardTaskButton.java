package org.labkey.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 8/2/13
 * Time: 12:26 PM
 */
public class DiscardTaskButton extends SimpleButtonConfigFactory
{
    public DiscardTaskButton(Module owner)
    {
        super(owner, "Discard Tasks", "EHR.DatasetButtons.discardTasks(dataRegionName);");
    }

    public boolean isAvailable(TableInfo ti)
    {
        if (ti.getUserSchema().getName().equalsIgnoreCase("ehr") && ti.getPublicName().equalsIgnoreCase("my_tasks"))
        {
            return ti.getUserSchema().getTable("tasks").hasPermission(ti.getUserSchema().getUser(), DeletePermission.class);
        }

        return false;
    }
}

