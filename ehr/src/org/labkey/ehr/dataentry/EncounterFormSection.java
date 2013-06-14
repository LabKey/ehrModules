package org.labkey.ehr.dataentry;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: bimber
 * Date: 6/9/13
 * Time: 4:15 PM
 */
public class EncounterFormSection extends SimpleFormSection
{
    public EncounterFormSection()
    {
        super("ehr", "tasks", "Task", "ehr-formpanel");
        List<String> sources = new ArrayList<String>(getConfigSources());
        sources.add("Encounter");
        setConfigSources(sources);
    }

    @Override
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject ret = super.toJSON(c, u);

        Map<String, Object> formConfig = new HashMap<String, Object>();
        Map<String, Object> bindConfig = new HashMap<String, Object>();
        bindConfig.put("createRecordOnLoad", true);
        formConfig.put("bindConfig", bindConfig);
        ret.put("formConfig", formConfig);

        return ret;
    }
}
