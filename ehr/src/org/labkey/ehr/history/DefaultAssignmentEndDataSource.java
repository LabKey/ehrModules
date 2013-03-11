package org.labkey.ehr.history;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Date;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultAssignmentEndDataSource extends AbstractDataSource
{
    public DefaultAssignmentEndDataSource()
    {
        super("study", "Assignment", "Assignment Release");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

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

        return sb.toString();
    }

    @Override
    protected String getDateField()
    {
        return "enddate";
    }

    @Override
    protected SimpleFilter getFilter(String subjectId, Date minDate, Date maxDate)
    {
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("id"), subjectId);

        if (minDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), minDate, CompareType.DATE_GTE);

        if (maxDate != null)
            filter.addCondition(FieldKey.fromString(getDateField()), maxDate, CompareType.DATE_LTE);

        filter.addCondition(FieldKey.fromString(getDateField()), null, CompareType.NONBLANK);

        return filter;
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "project", "project/name", "project/investigatorId", "project/investigatorId/lastname", "project/title");
    }
}

