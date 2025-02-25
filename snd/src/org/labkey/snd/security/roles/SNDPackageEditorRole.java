package org.labkey.snd.security.roles;

import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDPackageEditorPermission;
import org.labkey.snd.security.permissions.SNDPackageViewerPermission;

/**
 * Created by thawkins on 8/22/2019.
 */
public class SNDPackageEditorRole extends AbstractModuleScopedRole
{
    public SNDPackageEditorRole()
    {
        super("SND Package Editors", "Users with this role are permitted to edit SND packages.",
                SNDModule.class,
                SNDPackageViewerPermission.class,
                SNDPackageEditorPermission.class
        );


    }
}