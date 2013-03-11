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
 * Time: 12:26 PM
 */
public class AntibioticSensitivityLabworkType extends DefaultLabworkType
{
    private String _tissueField = "tissue/meaning";
    private String _microbeField = "microbe/meaning";
    private String _antibioticField = "antibiotic/meaning";

    public AntibioticSensitivityLabworkType()
    {
        super("Antibiotic Sensitivity", "study", "Antibiotic Sensitivity");
        _resultField = "resistant";
    }

    @Override
    protected Set<String> getColumnNames()
    {
        return PageFlowUtil.set(_idField, _dateField, _runIdField, _testIdField, _resultField, _antibioticField, _microbeField, _tissueField);
    }

    @Override
    protected String getLine(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();
        String microbe = rs.getString(FieldKey.fromString(_microbeField));
        Boolean result = rs.getBoolean(FieldKey.fromString(_resultField));
        String resultText = "";
        if (result != null)
            resultText = (!result ? "Not " : "") + "Resistant";

        String antibiotic = rs.getString(FieldKey.fromString(_antibioticField));
        String tissue = rs.getString(FieldKey.fromString(_tissueField));

        String delim = "";

        if (microbe != null)
        {
            sb.append(delim).append("Microbe: ").append(microbe);
            delim = "\n";
        }

        if (antibiotic != null)
        {
            sb.append(delim).append("Antibiotic: ").append(antibiotic);
            delim = "\n";
        }

        if (result != null)
        {
            sb.append(delim).append("Result: ").append(resultText);
            delim = "\n";
        }

        sb.append(delim);

        return sb.toString();
    }
}
