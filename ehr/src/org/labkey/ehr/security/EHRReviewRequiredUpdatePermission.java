package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRReviewRequiredUpdatePermission extends AbstractPermission
{
    public EHRReviewRequiredUpdatePermission()
    {
        super("EHRReviewRequiredUpdatePermission", "Can update data with the QC State: Review Required");
    }
}
