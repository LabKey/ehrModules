package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultClinicalRemarksDataSource extends AbstractDataSource
{
    public DefaultClinicalRemarksDataSource()
    {
        super("study", "Clinical Remarks", "Clinical Remark");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Hx", "hx"));
        sb.append(safeAppend(rs, "S/O", "so"));
        sb.append(safeAppend(rs, "S", "s"));
        sb.append(safeAppend(rs, "O", "o"));
        sb.append(safeAppend(rs, "A", "a"));
        sb.append(safeAppend(rs, "P", "p"));
        sb.append(safeAppend(rs, "P2", "p2"));
        sb.append(safeAppend(rs, "Other", "remark"));

        return sb.toString();
    }
}
