package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestPendingDeletePermission extends AbstractPermission
{
    public EHRRequestPendingDeletePermission()
    {
        super("EHRRequestPendingDeletePermission", "Can delete data with the QC State: Request: Pending");
    }
}
