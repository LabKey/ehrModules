package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultHousingDataSource extends AbstractDataSource
{
    public DefaultHousingDataSource()
    {
        super("study", "Housing", "Housing Transfer");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Room", "room"));
        sb.append(safeAppend(rs, "Cage", "cage"));

        return sb.toString();
    }
}
