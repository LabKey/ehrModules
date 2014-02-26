package org.labkey.ehr.buttons;

import org.labkey.api.ehr.security.EHRProjectEditPermission;
import org.labkey.api.ehr.security.EHRProtocolEditPermission;
import org.labkey.api.ldk.buttons.ShowEditUIButton;
import org.labkey.api.module.Module;

import java.util.HashMap;
import java.util.Map;

/**

 */
public class ProjectEditButton extends ShowEditUIButton
{
    public ProjectEditButton(Module owner, String schemaName, String queryName)
    {
        super(owner, schemaName, queryName, EHRProjectEditPermission.class);

        Map<String, String> urlParams = new HashMap<>();
        urlParams.put("key", "query.project~eq");
        setUrlParamMap(urlParams);
    }
}
