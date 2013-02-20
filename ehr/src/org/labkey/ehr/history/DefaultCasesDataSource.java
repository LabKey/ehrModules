package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultCasesDataSource extends AbstractDataSource
{
    public DefaultCasesDataSource()
    {
        super("study", "Cases", "Case Opened");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        sb.append("Case Opened").append("\n");
        sb.append(safeAppend(rs, "Case #", "caseno"));
        return sb.toString();
    }
}
