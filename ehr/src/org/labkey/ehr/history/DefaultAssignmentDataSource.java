package org.labkey.ehr.history;

import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultAssignmentDataSource extends AbstractDataSource
{
    public DefaultAssignmentDataSource()
    {
        super("study", "Assignment");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        if (rs.hasColumn(FieldKey.fromString("date")) && rs.getObject("date") != null)
            sb.append("Assignment Start: ").append(_dateFormat.format(rs.getDate("date")));

        if (rs.hasColumn(FieldKey.fromString("project")) && rs.getObject("project") != null)
            sb.append("Project: ").append(rs.getString("project"));

        if (rs.hasColumn(FieldKey.fromString("enddate")) && rs.getObject("enddate") != null)
            sb.append("Removal Date: ").append(_dateFormat.format(rs.getString("enddate")));

        return sb.toString();
    }
}
