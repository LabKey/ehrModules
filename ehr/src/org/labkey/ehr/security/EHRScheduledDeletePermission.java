package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRScheduledDeletePermission extends AbstractPermission
{
    public EHRScheduledDeletePermission()
    {
        super("EHRScheduledDeletePermission", "Can delete data with the QC State: Scheduled");
    }
}
