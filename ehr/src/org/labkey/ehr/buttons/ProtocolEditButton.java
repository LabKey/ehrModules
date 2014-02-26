package org.labkey.ehr.buttons;

import org.labkey.api.ehr.security.EHRProtocolEditPermission;
import org.labkey.api.ldk.buttons.ShowEditUIButton;
import org.labkey.api.module.Module;

import java.util.HashMap;
import java.util.Map;

/**

 */
public class ProtocolEditButton extends ShowEditUIButton
{
    public ProtocolEditButton(Module owner, String schemaName, String queryName)
    {
        super(owner, schemaName, queryName, EHRProtocolEditPermission.class);

        Map<String, String> urlParams = new HashMap<>();
        urlParams.put("key", "query.protocol~eq");
        setUrlParamMap(urlParams);
    }
}
