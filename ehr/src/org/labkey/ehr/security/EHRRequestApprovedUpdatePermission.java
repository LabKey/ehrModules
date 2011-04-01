package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestApprovedUpdatePermission extends AbstractPermission
{
    public EHRRequestApprovedUpdatePermission()
    {
        super("EHRRequestApprovedUpdatePermission", "Can update data with the QC State: Request: Approved");
    }
}
