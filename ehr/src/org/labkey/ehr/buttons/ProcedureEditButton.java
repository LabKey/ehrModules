package org.labkey.ehr.buttons;

import org.labkey.api.ehr.security.EHRProcedureManagementPermission;
import org.labkey.api.ehr.security.EHRProjectEditPermission;
import org.labkey.api.ldk.buttons.ShowEditUIButton;
import org.labkey.api.module.Module;

import java.util.HashMap;
import java.util.Map;

/**

 */
public class ProcedureEditButton extends ShowEditUIButton
{
    public ProcedureEditButton(Module owner, String schemaName, String queryName)
    {
        super(owner, schemaName, queryName, EHRProcedureManagementPermission.class);

        Map<String, String> urlParams = new HashMap<>();
        urlParams.put("procedureId", "query.procedureId~eq");
        setUrlParamMap(urlParams);
    }
}
