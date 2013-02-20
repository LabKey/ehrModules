package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultDeathsDataSource extends AbstractDataSource
{
    public DefaultDeathsDataSource()
    {
        super("study", "Deaths", "Death");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append(safeAppend(rs, "Cause", "cause"));
        sb.append(safeAppend(rs, "Manner", "manner"));
        sb.append(safeAppend(rs, "Necropsy #", "necropsy"));

        return sb.toString();
    }
}
