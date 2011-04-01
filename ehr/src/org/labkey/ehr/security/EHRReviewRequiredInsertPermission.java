package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRReviewRequiredInsertPermission extends AbstractPermission
{
    public EHRReviewRequiredInsertPermission()
    {
        super("EHRReviewRequiredInsertPermission", "Can insert data with the QC State: Review Required");
    }
}
