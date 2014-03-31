package org.labkey.ehr.buttons;

import org.labkey.api.ehr.buttons.EHRShowEditUIButton;
import org.labkey.api.ehr.security.EHRLocationEditPermission;
import org.labkey.api.ehr.security.EHRProjectEditPermission;
import org.labkey.api.module.Module;

import java.util.HashMap;
import java.util.Map;

/**

 */
public class LocationEditButton extends EHRShowEditUIButton
{
    public LocationEditButton(Module owner, String schemaName, String queryName)
    {
        super(owner, schemaName, queryName, EHRLocationEditPermission.class);
    }
}
