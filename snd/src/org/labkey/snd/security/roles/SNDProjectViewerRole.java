package org.labkey.snd.security.roles;

import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDProjectViewerPermission;

/**
 * Created by thawkins on 9/10/2019.
 */
public class SNDProjectViewerRole extends AbstractModuleScopedRole
{
    public SNDProjectViewerRole()
    {
        super("SND Project Viewers", "Users with this role are permitted to view SND projects.",
                SNDModule.class,
                SNDProjectViewerPermission.class
        );


    }
}