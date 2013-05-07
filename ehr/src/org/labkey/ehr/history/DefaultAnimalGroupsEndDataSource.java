package org.labkey.ehr.history;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.HistoryRow;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/23/13
 * Time: 9:32 PM
 */
public class DefaultAnimalGroupsEndDataSource extends AbstractDataSource
{
    public DefaultAnimalGroupsEndDataSource()
    {
        super("ehr", "animal_group_members", "Removed From Group");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        String value = rs.getString(FieldKey.fromString("groupId/name"));
        if (value != null)
            sb.append("Removed from group: " + value).append("\n");

        return sb.toString();
    }

    @Override
    protected String getDateField()
    {
        return "enddate";
    }

    @Override
    protected List<HistoryRow> getRows(Container c, User u, SimpleFilter filter)
    {
        filter.addCondition(FieldKey.fromString(getDateField()), null, CompareType.NONBLANK);
        return super.getRows(c, u, filter);
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "groupId", "groupId/name");
    }
}
