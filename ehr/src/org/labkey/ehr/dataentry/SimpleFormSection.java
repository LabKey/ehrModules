package org.labkey.ehr.dataentry;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.ehr.dataentry.AbstractFormSection;
import org.labkey.api.security.User;
import org.labkey.api.util.Pair;

import java.util.HashSet;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/27/13
 * Time: 10:54 AM
 */
public class SimpleFormSection extends AbstractFormSection
{
    private String _schemaName;
    private String _queryName;

    public SimpleFormSection(String schemaName, String queryName, String label, String xtype)
    {
        super(queryName, label, xtype);
        _schemaName = schemaName;
        _queryName = queryName;
    }

    @Override
    public Set<Pair<String, String>> getTableNames()
    {
        Set<Pair<String, String>> tables = new HashSet<Pair<String, String>>();
        tables.add(Pair.of(_schemaName, _queryName));
        return tables;
    }

    @Override
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = super.toJSON(c, u);
        json.put("schemaName", _schemaName);
        json.put("queryName", _queryName);

        return json;
    }
}
