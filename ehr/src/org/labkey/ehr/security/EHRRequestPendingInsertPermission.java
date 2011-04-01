package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRRequestPendingInsertPermission extends AbstractPermission
{
    public EHRRequestPendingInsertPermission()
    {
        super("EHRRequestPendingInsertPermission", "Can insert data with the QC State: Request: Pending");
    }
}
