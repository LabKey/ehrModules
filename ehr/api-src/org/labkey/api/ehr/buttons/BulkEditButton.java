package org.labkey.api.ehr.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.security.EHRVeternarianPermission;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.view.template.ClientDependency;

public class BulkEditButton extends SimpleButtonConfigFactory
{
    public BulkEditButton(Module owner)
    {
        super(owner, "Bulk Edit", "EHR.DatasetButtons.addBulkEditHandler(dataRegionName);");
        setClientDependencies(ClientDependency.fromModuleName("ehr"), ClientDependency.fromPath("ehr/window/studyButtons.js"));
        setInsertPosition(-1);
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti.getUserSchema().getContainer().hasPermission(ti.getUserSchema().getUser(), EHRVeternarianPermission.class);
    }
}