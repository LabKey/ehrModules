package org.labkey.ehr.history;

import org.labkey.api.data.Results;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultTBDataSource extends AbstractDataSource
{
    public DefaultTBDataSource()
    {
        super("study", "TB Tests", "TB Test");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append("TB Test Performed\n");
        sb.append(safeAppend(rs, "Lot", "lot"));
        sb.append(safeAppend(rs, "Result", "result"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        return sb.toString();
    }
}
