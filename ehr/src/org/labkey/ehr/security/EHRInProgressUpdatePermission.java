package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRInProgressUpdatePermission extends AbstractPermission
{
    public EHRInProgressUpdatePermission()
    {
        super("EHRInProgressUpdatePermission", "Can update data with the QC State: In Progress");
    }
}
