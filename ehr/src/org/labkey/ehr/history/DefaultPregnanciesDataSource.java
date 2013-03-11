package org.labkey.ehr.history;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Results;
import org.labkey.api.data.TableInfo;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Collection;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultPregnanciesDataSource extends AbstractDataSource
{
    public DefaultPregnanciesDataSource()
    {
        super("study", "Pregnancy Confirmations", "Pregnancy Confirmation");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Sire", "sire"));
        sb.append(safeAppend(rs, "Confirmation Type", "confirmationType/value"));
        sb.append(safeAppend(rs, "Estimated Delivery Date", "estDeliveryDate"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "sire", "confirmationType", "confirmationType/value", "estDeliveryDate", "remark");
    }
}
