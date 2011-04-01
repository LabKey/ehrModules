package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestPendingUpdatePermission extends AbstractPermission
{
    public EHRRequestPendingUpdatePermission()
    {
        super("EHRRequestPendingUpdatePermission", "Can update data with the QC State: Request: Pending");
    }
}
