package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * User: bbimber
 * Date: Mar 24, 2011
 */
public class EHRAbnormalInsertPermission extends AbstractPermission
{
    public EHRAbnormalInsertPermission()
    {
        super("EHRAbnormalInsertPermission", "Can insert data with the QC State: Abnormal");
    }
}
