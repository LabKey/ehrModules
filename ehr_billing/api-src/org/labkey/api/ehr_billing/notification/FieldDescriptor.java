/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
