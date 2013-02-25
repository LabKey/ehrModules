package org.labkey.ehr.history;

import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

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
            sb.append("Assignment Start: ").append(_dateFormat.format(rs.getDate("date"))).append("\n");

        FieldKey projname = FieldKey.fromString("project/name");
        if (rs.hasColumn(projname) && rs.getObject(projname) != null)
        {
            sb.append("Project: ").append(rs.getString(projname)).append("\n");

            FieldKey inves = FieldKey.fromString("project/investigatorId/lastname");
            if (rs.hasColumn(inves) && rs.getObject(inves) != null)
                sb.append("Investigator: ").append(rs.getString(inves)).append("\n");

            FieldKey title = FieldKey.fromString("project/title");
            if (rs.hasColumn(title) && rs.getObject(title) != null)
                sb.append("Title: ").append(rs.getString(title)).append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("enddate")) && rs.getObject("enddate") != null)
            sb.append("Removal Date: ").append(_dateFormat.format(rs.getDate("enddate"))).append("\n");

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "project", "project/name", "project/investigatorId", "project/investigatorId/lastname", "project/title");
    }
}
