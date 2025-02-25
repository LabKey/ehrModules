package org.labkey.snd.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created by thawkins on 8/22/2019.
 */
public class SNDPackageViewerPermission extends AbstractPermission
{
    public SNDPackageViewerPermission()
    {
        super("SNDPackageViewerPermission", "This is the base permission required to view SND packages.");
    }

}
