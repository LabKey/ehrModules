package org.labkey.snd.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;


/**
 * Created by thawkins on 9/10/2019.
 */
public class SNDProjectEditorPermission extends AbstractPermission
{
    public SNDProjectEditorPermission()
    {
        super("SNDProjectEditorPermission", "This is the base permission required to edit SND projects.");
    }

}