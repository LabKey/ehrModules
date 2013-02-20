package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultAlopeciaDataSource extends AbstractDataSource
{
    public DefaultAlopeciaDataSource()
    {
        super("study", "Alopecia");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Alopecia Score", "score"));
        sb.append(safeAppend(rs, "Cause", "cause"));

        return sb.toString();
    }
}
