package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRScheduledUpdatePermission extends AbstractPermission
{
    public EHRScheduledUpdatePermission()
    {
        super("EHRScheduledUpdatePermission", "Can update data with the QC State: Scheduled");
    }
}
