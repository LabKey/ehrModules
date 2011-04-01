package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRInProgressInsertPermission extends AbstractPermission
{
    public EHRInProgressInsertPermission()
    {
        super("EHRInProgressInsertPermission", "Can insert data with the QC State: In Progress");
    }
}
