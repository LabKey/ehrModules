package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 1/17/13
 * Time: 7:49 PM
 */
public class EHRDataEntryPermission extends AbstractPermission
{
    public EHRDataEntryPermission()
    {
        super("EHRDataEntryPermission", "This is the base permission required in order to submit data to any colony records table");
    }
}
