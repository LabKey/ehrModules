package org.labkey.snd.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created by thawkins on 8/22/2019.
 */
public class SNDPackageEditorPermission extends AbstractPermission
{
    public SNDPackageEditorPermission()
    {
        super("SNDPackageEditorPermission", "This is the base permission required to edit SND packages.");
    }

}
