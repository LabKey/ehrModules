package org.labkey.ehr.security;

import org.labkey.api.data.Container;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.AbstractRole;
import org.labkey.ehr.EHRModule;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 1/17/13
 * Time: 7:43 PM
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
        return resource instanceof Container ? ((Container)resource).getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class)) : false;
    }
}
