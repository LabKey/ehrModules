package org.labkey.snd.security.permissions;

import org.labkey.api.security.permissions.AbstractPermission;


/**
 * Created by thawkins on 8/6/2024.
 */
public class SNDEditorPermission extends AbstractPermission
{
    public SNDEditorPermission()
    {
        super("SNDEditorPermission", "This is the base permission required to Edit SND Data.");
    }

}
