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
public class DefaultTreatmentOrdersDataSource extends AbstractDataSource
{
    public DefaultTreatmentOrdersDataSource()
    {
        super("study", "Treatment Orders", "Treatment Ordered");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append(snomedToString(rs, FieldKey.fromString("code"), FieldKey.fromString("code/meaning")));
        sb.append(safeAppend(rs, "Reason", "reason"));
        sb.append(safeAppend(rs, "Route", "route"));

        //TODO: conditional based on whether it has ended or not?  maybe a note for 'ending in X days?'

        if (rs.hasColumn(FieldKey.fromString("duration")) && rs.getObject("duration") != null)
        {
            int duration = rs.getInt("duration");
            sb.append("Duration: ").append(duration == 0 ? 1 : duration).append(" days").append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("concentration")) && rs.getObject("concentration") != null)
        {
            sb.append("Concentration: " + rs.getString("concentration"));

            if (rs.hasColumn(FieldKey.fromString("conc_units")) && rs.getObject("conc_units") != null)
            {
                sb.append(" " + rs.getString("conc_units"));
            }

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("dosage")) && rs.getObject("dosage") != null)
        {
            sb.append("Dosage: " + rs.getString("dosage"));

            if (rs.hasColumn(FieldKey.fromString("dosage_units")) && rs.getObject("dosage_units") != null)
                sb.append(" " + rs.getString("dosage_units"));

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("volume")) && rs.getObject("volume") != null)
        {
            sb.append("Volume: " + rs.getString("volume"));

            if (rs.hasColumn(FieldKey.fromString("vol_units")) && rs.getObject("vol_units") != null)
                sb.append(" " + rs.getString("vol_units"));

            sb.append("\n");
        }

        if (rs.hasColumn(FieldKey.fromString("amount")) && rs.getObject("amount") != null)
        {
            sb.append("Amount: " + rs.getString("amount"));

            if (rs.hasColumn(FieldKey.fromString("amount_units")) && rs.getObject("amount_units") != null)
                sb.append(" " + rs.getString("amount_units"));

            sb.append("\n");
        }

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "route", "volume", "vol_units", "amount", "amount_units", "code", "code/meaning", "duration");
    }
}
