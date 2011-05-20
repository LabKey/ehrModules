package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRCompletedDeletePermission extends AbstractPermission
{
    public EHRCompletedDeletePermission()
    {
        super("EHRCompletedDeletePermission", "Can delete data with the QC State: Completed");
    }
}
