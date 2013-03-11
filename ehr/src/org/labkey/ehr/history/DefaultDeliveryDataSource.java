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
public class DefaultDeliveryDataSource extends AbstractDataSource
{
    public DefaultDeliveryDataSource()
    {
        super("study", "Delivery");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Delivery Type", "deliveryType/value"));
        sb.append(safeAppend(rs, "Sire", "sire"));
        sb.append(safeAppend(rs, "Infant", "infant"));
        sb.append(safeAppend(rs, "Remark", "remark"));

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "sire", "infant", "deliveryType/value", "deliveryType", "remark");
    }
}
