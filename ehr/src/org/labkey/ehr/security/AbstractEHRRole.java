package org.labkey.ehr.security;

import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.api.study.DataSet;
import org.labkey.ehr.EHRModule;

/**
 * User: jeckels
 * Date: Feb 25, 2011
 */
public class AbstractEHRRole extends AbstractRole
{
    protected AbstractEHRRole(String name, String description, Class<? extends Permission>... perms)
    {
        super(name, description, EHRModule.class, perms);
    }

    @Override
    public boolean isApplicable(SecurityPolicy policy, SecurableResource resource)
    {
        return resource instanceof DataSet &&
                ((DataSet)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class));
    }
}
