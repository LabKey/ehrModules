package org.labkey.snd.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;


/**
 * Created by thawkins on 9/10/2019.
 */
public class SNDProjectViewerPermission extends AbstractPermission
{
    public SNDProjectViewerPermission()
    {
        super("SNDProjectViewerPermission", "This is the base permission required to view SND Projects.");
    }

}