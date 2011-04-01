package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestCompleteDeletePermission extends AbstractPermission
{
    public EHRRequestCompleteDeletePermission()
    {
        super("EHRRequestCompleteDeletePermission", "Can delete data with the QC State: Request: Complete");
    }
}
