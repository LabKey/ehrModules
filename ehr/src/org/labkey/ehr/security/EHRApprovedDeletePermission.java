package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRApprovedDeletePermission extends AbstractPermission
{
    public EHRApprovedDeletePermission()
    {
        super("EHRApprovedDeletePermission", "Can delete data with the QC State: Approved");
    }
}
