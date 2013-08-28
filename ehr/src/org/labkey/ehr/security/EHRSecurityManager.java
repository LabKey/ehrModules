package org.labkey.ehr.security;

import org.labkey.api.data.TableInfo;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.study.DataSet;
import org.labkey.ehr.EHRManager;
import org.labkey.ehr.utils.EHRQCState;

import java.util.Collection;

/**
 * User: bimber
 * Date: 8/21/13
 * Time: 6:52 AM
 */
public class EHRSecurityManager
{
    private static final EHRSecurityManager _instance = new EHRSecurityManager();

    private EHRSecurityManager()
    {

    }

    public static EHRSecurityManager get()
    {
        return _instance;
    }

    public boolean testPermission (User u, TableInfo ti, Class<? extends Permission> perm, EHRQCState qcState)
    {
        //TODO
        return true;
    }

    public boolean testPermission (User u, SecurableResource resource, Class<? extends Permission> perm, EHRQCState qcState)
    {
        Collection<Class<? extends Permission>> permissions;
        String className = getPermissionClassName(perm, qcState);

        //NOTE: See getResourceProps() in SecurityApiActions for notes on this hack
        if (resource instanceof DataSet)
        {
            DataSet ds = (DataSet)resource;
            permissions = ds.getPermissions(u);
        }
        else
        {
            SecurityPolicy policy = SecurityPolicyManager.getPolicy(resource);
            permissions = policy.getPermissions(u);
        }

        for (Class<? extends Permission> p : permissions)
        {
            if (p.getName().equals(className))
                return true;
        }

        return false;
    }

    public String getPermissionClassName(Class<? extends Permission> perm, EHRQCState qc)
    {
        //TODO: this is a little ugly
        String permString = perm.getCanonicalName().replaceAll(perm.getPackage().getName() + "\\.", "");
        String qcString = qc.getLabel().replaceAll("[^a-zA-Z0-9-]", "");
        return EHRManager.SECURITY_PACKAGE + ".EHR" + qcString + permString;
    }
}
