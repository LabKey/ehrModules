package org.labkey.snd.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;


/**
 * Created by thawkins on 8/6/2024.
 */
public class SNDViewerPermission extends AbstractPermission
{
    public SNDViewerPermission()
    {
        super("SNDViewerPermission", "This is the base permission required to view SND Data.");
    }

}