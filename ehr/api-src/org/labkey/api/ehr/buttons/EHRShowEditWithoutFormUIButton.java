package org.labkey.api.ehr.buttons;

import org.labkey.api.ldk.buttons.ShowEditUIButton;
import org.labkey.api.module.Module;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.view.template.ClientDependency;

public class EHRShowEditWithoutFormUIButton extends ShowEditUIButton
{
    public EHRShowEditWithoutFormUIButton(Module owner, String schemaName, String queryName, Class<? extends Permission>... perms)
    {
        super(owner, schemaName, queryName, perms);
        setClientDependencies(ClientDependency.supplierFromModuleName("ehr"));
    }

    public EHRShowEditWithoutFormUIButton(Module owner, String schemaName, String queryName, String label, Class<? extends Permission>... perms)
    {
        super(owner, schemaName, queryName, label, perms);
        setClientDependencies(ClientDependency.supplierFromModuleName("ehr"));
    }

    @Override
    protected String getHandlerName()
    {
        return "EHR.Utils.editUIButtonWithoutFormHandler";
    }
}
