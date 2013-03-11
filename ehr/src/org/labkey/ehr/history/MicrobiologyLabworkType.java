package org.labkey.ehr.history;

import org.apache.commons.lang3.StringUtils;
import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 12:27 PM
 */
public class MicrobiologyLabworkType extends DefaultLabworkType
{
    public MicrobiologyLabworkType()
    {
        super("Microbiology", "study", "Microbiology Results");
        _resultField = "quantity";
        _testIdField = "organism/meaning";
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set(_lsidField, _idField, _dateField, _runIdField, _testIdField, _resultField);
    }

    @Override
    protected String getLine(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        Double result = rs.getDouble(FieldKey.fromString(_resultField));
        String organism = rs.getString(FieldKey.fromString(_testIdField));
        String delim = "";

        if (organism != null)
        {
            sb.append(organism).append(": ");
            if (result != null)
                sb.append(result);

            delim = "\n";
        }

        sb.append(delim);

        return sb.toString();
    }
}
