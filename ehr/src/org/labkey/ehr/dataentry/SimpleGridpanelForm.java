package org.labkey.ehr.dataentry;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;
import org.labkey.api.ehr.dataentry.FormSection;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 11:03 AM
 */
public class SimpleGridpanelForm extends AbstractDataEntryForm
{
    private SimpleGridpanelForm(Module owner, String name, String label, String category, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
    }

    public static SimpleGridpanelForm create(Module owner, String schemaName, String queryName, String category)
    {
        List<FormSection> sections = new ArrayList<FormSection>();
        String label = StringUtils.capitalize(queryName);
        sections.add(new SimpleGridPanel(schemaName, queryName, label));

        return new SimpleGridpanelForm(owner, queryName, label, category, sections);
    }

    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = super.toJSON(c, u);

        //TODO
        List<JSONObject> columns = new ArrayList<JSONObject>();
        json.put("columns", columns);

        return json;
    }
}
