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
public class DefaultBodyConditionDataSource extends AbstractDataSource
{
    public DefaultBodyConditionDataSource()
    {
        super("study", "Body Condition");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "BCS", "score"));

        if (rs.hasColumn(FieldKey.fromString("weightstatus")) && rs.getObject("weightStatus") != null)
        {
            Boolean value = rs.getBoolean("weightStatus");
            sb.append("Weight Monitoring Needed?: ").append(value).append("\n");
        }

        return sb.toString();
    }
}
