package org.labkey.ehr.dataentry;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * User: bimber
 * Date: 6/9/13
 * Time: 4:15 PM
 */
public class TaskFormSection extends SimpleFormSection
{
    public TaskFormSection()
    {
        super("ehr", "tasks", "Task", "ehr-formpanel");
        setConfigSources(Collections.singletonList("Task"));
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
