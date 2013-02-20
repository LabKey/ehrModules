package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultDepartureDataSource extends AbstractDataSource
{
    public DefaultDepartureDataSource()
    {
        super("study", "Departure");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Authorized By", "authorize"));
        sb.append(safeAppend(rs, "Destination", "destination"));

        return sb.toString();
    }
}
