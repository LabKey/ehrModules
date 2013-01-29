package org.labkey.ehr.security;

import org.labkey.api.security.permissions.AbstractPermission;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 1/17/13
 * Time: 7:49 PM
 */
public class EHRRequestPermission extends AbstractPermission
{
    public EHRRequestPermission()
    {
        super("EHRRequestPermission", "This is the base permission required in order to submit requests for serivces in the EHR");
    }
}
