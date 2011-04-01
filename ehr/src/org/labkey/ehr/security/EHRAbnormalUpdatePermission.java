package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRAbnormalUpdatePermission extends AbstractPermission
{
    public EHRAbnormalUpdatePermission()
    {
        super("EHRAbnormalUpdatePermission", "Can update data with the QC State: Abnormal");
    }
}
