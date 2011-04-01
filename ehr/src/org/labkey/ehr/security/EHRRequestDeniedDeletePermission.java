package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestDeniedDeletePermission extends AbstractPermission
{
    public EHRRequestDeniedDeletePermission()
    {
        super("EHRRequestDeniedDeletePermission", "Can delete data with the QC State: Request: Denied");
    }
}
