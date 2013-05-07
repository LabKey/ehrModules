package org.labkey.ehr.history;

import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/23/13
 * Time: 9:32 PM
 */
public class DefaultAnimalGroupsDataSource extends AbstractDataSource
{
    public DefaultAnimalGroupsDataSource()
    {
        super("ehr", "animal_group_members", "Added To Group");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        String value = rs.getString(FieldKey.fromString("groupId/name"));
        if (value != null)
            sb.append("Add to group: " + value).append("\n");

        return sb.toString();
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set("Id", "date", "enddate", "groupId", "groupId/name");
    }
}
