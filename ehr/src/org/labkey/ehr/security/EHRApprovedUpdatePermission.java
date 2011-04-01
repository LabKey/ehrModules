package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRApprovedUpdatePermission extends AbstractPermission
{
    public EHRApprovedUpdatePermission()
    {
        super("EHRApprovedUpdatePermission", "Can update data with the QC State: Approved");
    }
}
