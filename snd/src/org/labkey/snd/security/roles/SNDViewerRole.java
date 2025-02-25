package org.labkey.snd.security.roles;

import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDViewerPermission;

/**
 * Created by thawkins on 8/6/2024.
 */
public class SNDViewerRole extends AbstractModuleScopedRole
{
    public SNDViewerRole()
    {
        super("SND Data Viewers", "Users with this role are permitted to view SND data.",
                SNDModule.class,
                SNDViewerPermission.class
        );


    }
}