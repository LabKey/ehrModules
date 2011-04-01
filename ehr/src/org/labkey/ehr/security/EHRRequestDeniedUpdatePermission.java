package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestDeniedUpdatePermission extends AbstractPermission
{
    public EHRRequestDeniedUpdatePermission()
    {
        super("EHRRequestDeniedUpdatePermission", "Can update data with the QC State: Request: Denied");
    }
}
