package org.labkey.api.ehr;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;

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
