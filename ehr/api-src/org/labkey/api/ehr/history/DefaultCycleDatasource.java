package org.labkey.api.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import java.sql.SQLException;

public class DefaultCycleDatasource extends AbstractDataSource
{
    public DefaultCycleDatasource(Module module)
    {
        super("study", "estrousCyclePivot", "Cycles", "Cycles", module);
        setShowTime(true);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        addStringField(rs, sb, "tumescence_index::observations", "TI: ");
        addStringField(rs, sb, "vaginal_bleeding::observations", "VB");
        addStringField(rs, sb, "purple_color::observations", "PC");
        addStringField(rs, sb, "carrying_infant::observations", "CI");
        addStringField(rs, sb, "male_status::observations", "Male Status: ");
        addStringField(rs, sb, "male_id::observations", "Male Id");
        addStringField(rs, sb, "cycle_location::observations", "Cycle Location");
        addStringField(rs, sb, "observer_emp_num::observations", "Observer");

        return sb.toString();
    }

    private void addStringField(Results rs, StringBuilder sb, String columnName, String displayLabel) throws SQLException
    {
        if (rs.hasColumn(FieldKey.fromString(columnName)) && rs.getObject(new FieldKey(null,columnName)) != null)
        {
            addField(sb, displayLabel, "", rs.getString(new FieldKey(null,columnName)));
        }
    }

    private void addField(StringBuilder sb, String displayLabel, String suffix, String value)
    {
        sb.append(displayLabel);
        sb.append(": ");
        sb.append(value);
        sb.append(suffix);
        sb.append("\n");
    }

}
