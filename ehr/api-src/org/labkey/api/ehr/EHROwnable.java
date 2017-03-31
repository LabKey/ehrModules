package org.labkey.api.ehr;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;

/**
 * Base class for EHR resources that are owned by and enabled/disabled based on which modules are enabled
 * in the current folder.
 */
public abstract class EHROwnable
{
    protected Module _owner = null;

    public EHROwnable(Module owner)
    {
        _owner = owner;
    }

    public boolean isAvailable(Container c,User u)
    {
        if (_owner != null && !c.getActiveModules().contains(_owner))
            return false;

        return c.getActiveModules(u).contains(ModuleLoader.getInstance().getModule("ehr"));
    }
}
