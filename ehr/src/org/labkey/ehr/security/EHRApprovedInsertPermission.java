package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRApprovedInsertPermission extends AbstractPermission
{
    public EHRApprovedInsertPermission()
    {
        super("EHRApprovedInsertPermission", "Can insert data with the QC State: Approved");
    }
}
