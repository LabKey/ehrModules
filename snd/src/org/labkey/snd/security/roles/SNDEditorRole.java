package org.labkey.snd.security.roles;

import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDEditorPermission;
import org.labkey.snd.security.permissions.SNDViewerPermission;

/**
 * Created by thawkins on 8/6/2024.
 */
public class SNDEditorRole extends AbstractModuleScopedRole
{
    public SNDEditorRole()
    {
        super("SND Data Editors", "Users with this role are permitted to Edit SND data.",
                SNDModule.class,
                SNDViewerPermission.class,
                SNDEditorPermission.class
        );


    }
}