package org.labkey.ehr.dataentry;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.dataentry.AbstractDataEntryForm;import org.labkey.api.ehr.dataentry.FormSection;import org.labkey.api.ehr.security.EHRInProgressInsertPermission;
import org.labkey.api.module.Module;
import org.labkey.api.security.User;
import org.labkey.api.security.permissions.Permission;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * User: bimber
 * Date: 4/27/13
 * Time: 12:45 PM
 */
public class SingleQueryForm extends AbstractDataEntryForm
{
    private TableInfo _table;

    private SingleQueryForm(Module owner, String name, String label, String category, TableInfo ti, List<FormSection> sections)
    {
        super(owner, name, label, category, sections);
        setJavascriptClass("EHR.panel.SimpleDataEntryPanel");

        _table = ti;

        for (FormSection s : getFormSections())
        {
            s.addConfigSource("SimpleForm");
        }
    }

    public static SingleQueryForm create(Module owner, TableInfo ti)
    {
        List<FormSection> sections = new ArrayList<>();
        sections.add(new SimpleFormPanel(ti.getPublicSchemaName(), ti.getPublicName(), ti.getTitle()));

        return new SingleQueryForm(owner, ti.getPublicName(), ti.getTitle(), "Custom", ti, sections);
    }

    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = super.toJSON(c, u);
        json.put("pkCols", _table.getPkColumnNames());

        return json;
    }


    @Override
    protected List<String> getButtonConfigs()
    {
        return Collections.singletonList("SUBMIT");
    }

    @Override
    protected List<String> getMoreActionButtonConfigs()
    {
        return Collections.emptyList();
    }
}
