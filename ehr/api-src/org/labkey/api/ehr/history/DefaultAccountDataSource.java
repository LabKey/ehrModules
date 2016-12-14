package org.labkey.api.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import java.sql.SQLException;

public class DefaultAccountDataSource extends AbstractDataSource
{
    public DefaultAccountDataSource(Module module)
    {
        super("study", "animalAccounts", "Accounts", "Accounts", module);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        if (rs.hasColumn(FieldKey.fromString("account")) && rs.getObject("account") != null)
        {
            sb.append(rs.getObject("account")).append("\n");
        }

        return sb.toString();
    }
}
