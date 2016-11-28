package org.labkey.api.ehr.history;

/**
 * Created by Marty on 11/28/2016.
 */

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;

import java.sql.SQLException;

public class DefaultTBDataSource extends AbstractDataSource
{
    public DefaultTBDataSource(Module module)
    {
        super("study", "tb", "TB", "TB", module);
        setShowTime(true);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        if (rs.hasColumn(FieldKey.fromString("tb_site")) && rs.getObject("tb_site") != null)
        {
            addRow(sb, "Site", rs.getString("tb_site"));
        }

        if (rs.hasColumn(FieldKey.fromString("Result")) && rs.getObject("Result") != null)
        {
            addRow(sb, "Result", rs.getString("Result"));
        }

        return sb.toString();
    }

    private void addRow(StringBuilder sb, String displayLabel, String value)
    {
        sb.append(displayLabel);
        sb.append(": ");
        sb.append(value);
        sb.append("\n");
    }
}

