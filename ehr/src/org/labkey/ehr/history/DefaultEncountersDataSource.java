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
public class DefaultEncountersDataSource extends AbstractDataSource
{
    public DefaultEncountersDataSource()
    {
        super("study", "Clinical Encounters", "Encounter");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        //TODO: switch based on type

        sb.append(safeAppend(rs, "Type", "type"));
        sb.append(safeAppend(rs, "Title", "title"));

        if (rs.hasColumn(FieldKey.fromString("major")) && rs.getObject("major") != null)
        {
            Boolean value = rs.getBoolean("major");
            sb.append("Major Surgery?: ").append(value).append("\n");
        }

        return sb.toString();
    }
}
