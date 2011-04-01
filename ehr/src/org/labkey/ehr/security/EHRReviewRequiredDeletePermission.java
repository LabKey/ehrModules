package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRReviewRequiredDeletePermission extends AbstractPermission
{
    public EHRReviewRequiredDeletePermission()
    {
        super("EHRReviewRequiredDeletePermission", "Can delete data with the QC State: Review Required");
    }
}
