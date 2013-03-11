package org.labkey.ehr.history;

import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.PageFlowUtil;

import java.sql.SQLException;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/6/13
 * Time: 12:27 PM
 */
public class ParasitologyLabworkType extends DefaultLabworkType
{
    private String _methodField = "method";

    public ParasitologyLabworkType()
    {
        super("Parasitology", "study", "Parasitology Results");
        _testIdField = "organism/meaning";
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set(_lsidField, _idField, _dateField, _runIdField, _testIdField, _resultField, _methodField);
    }

    @Override
    protected String getLine(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        Double result = rs.getDouble(FieldKey.fromString(_resultField));
        String organism = rs.getString(FieldKey.fromString(_testIdField));
        String method = rs.getString(FieldKey.fromString(_methodField));

        String delim = "";

        if (method != null)
        {
            sb.append(delim).append("Method: ").append(method);
            delim = "\n";
        }

        if (organism != null)
        {
            sb.append(delim).append("Organism: ").append(organism);
            delim = "\n";
        }

        sb.append(delim);

        return sb.toString();
    }
}
