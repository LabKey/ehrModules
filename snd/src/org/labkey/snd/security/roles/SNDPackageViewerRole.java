package org.labkey.snd.security.roles;

import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDPackageViewerPermission;

/**
 * Created by thawkins on 8/22/2019.
 */
public class SNDPackageViewerRole extends AbstractModuleScopedRole
{
    public SNDPackageViewerRole()
    {
        super("SND Package Viewers", "Users with this role are permitted to view SND packages.",
                SNDModule.class,
                SNDPackageViewerPermission.class
        );


    }
}