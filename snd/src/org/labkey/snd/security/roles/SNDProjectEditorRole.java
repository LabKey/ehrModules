package org.labkey.snd.security.roles;

import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDProjectEditorPermission;
import org.labkey.snd.security.permissions.SNDProjectViewerPermission;

/**
 * Created by thawkins on 9/10/2019.
 */
public class SNDProjectEditorRole extends AbstractModuleScopedRole
{
    public SNDProjectEditorRole()
    {
        super("SND Project Editors", "Users with this role are permitted to edit SND projects.",
                SNDModule.class,
                SNDProjectViewerPermission.class,
                SNDProjectEditorPermission.class
        );


    }
}