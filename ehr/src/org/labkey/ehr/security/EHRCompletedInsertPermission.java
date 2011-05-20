package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRCompletedInsertPermission extends AbstractPermission
{
    public EHRCompletedInsertPermission()
    {
        super("EHRCompletedInsertPermission", "Can insert data with the QC State: Completed");
    }
}
