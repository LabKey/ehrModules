package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestApprovedInsertPermission extends AbstractPermission
{
    public EHRRequestApprovedInsertPermission()
    {
        super("EHRRequestApprovedInsertPermission", "Can insert data with the QC State: Request: Approved");
    }
}
