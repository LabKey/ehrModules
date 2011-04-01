package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestApprovedDeletePermission extends AbstractPermission
{
    public EHRRequestApprovedDeletePermission()
    {
        super("EHRRequestApprovedDeletePermission", "Can delete data with the QC State: Request: Approved");
    }
}
