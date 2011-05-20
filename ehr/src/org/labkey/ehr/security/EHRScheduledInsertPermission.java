package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRScheduledInsertPermission extends AbstractPermission
{
    public EHRScheduledInsertPermission()
    {
        super("EHRScheduledInsertPermission", "Can insert data with the QC State: Scheduled");
    }
}
