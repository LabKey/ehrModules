package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultBloodDrawDataSource extends AbstractDataSource
{
    public DefaultBloodDrawDataSource()
    {
        super("study", "Blood Draws", "Blood Draw");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Total Quantity", "quantity"));
        sb.append(safeAppend(rs, "Billed By", "billedby"));
        sb.append(safeAppend(rs, "Tube Type", "tube_type"));
        sb.append(safeAppend(rs, "# of Tubes", "num_tubes"));
        sb.append(safeAppend(rs, "Additional Services", "additionalServices"));

        return sb.toString();
    }
}
