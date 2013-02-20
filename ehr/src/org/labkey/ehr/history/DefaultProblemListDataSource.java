package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultProblemListDataSource extends AbstractDataSource
{
    public DefaultProblemListDataSource()
    {
        super("study", "Problem List", "Problem Created");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Category", "category"));
        sb.append(safeAppend(rs, "Problem #", "problem_no"));

        return sb.toString();
    }
}
