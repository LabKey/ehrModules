package org.labkey.api.ehr_billing.notification;

import org.labkey.api.data.Results;
import org.labkey.api.query.FieldKey;

import java.sql.SQLException;

public class FieldDescriptor {
    private String _fieldName;
    private boolean _flagIfNonNull;
    private String _label;
    private boolean _shouldHighlight;

    public FieldDescriptor(String fieldName, boolean flagIfNonNull, String label, boolean shouldHighlight)
    {
        _fieldName = fieldName;
        _flagIfNonNull = flagIfNonNull;
        _label = label;
        _shouldHighlight = shouldHighlight;
    }

    public String getFieldName()
    {
        return _fieldName;
    }

    public boolean isShouldHighlight()
    {
        return _shouldHighlight;
    }

    public FieldKey getFieldKey()
    {
        return FieldKey.fromString(_fieldName);
    }

    public String getLabel()
    {
        return _label;
    }

    public boolean shouldFlag(Results rs) throws SQLException
    {
        Object val = rs.getObject(getFieldKey());

        return _flagIfNonNull ? val != null : val == null;
    }

    public String getFilter()
    {
        return "&query." + getFieldName() + "~" + (_flagIfNonNull ? "isnonblank" : "isblank");
    }
}
