package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRAbnormalDeletePermission extends AbstractPermission
{
    public EHRAbnormalDeletePermission()
    {
        super("EHRAbnormalDeletePermission", "Can delete data with the QC State: Abnormal");
    }
}
