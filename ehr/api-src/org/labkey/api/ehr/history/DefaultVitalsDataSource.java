/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
package org.labkey.api.ehr.history;


import org.labkey.api.data.Container;
import org.labkey.api.data.Results;
import org.labkey.api.ehr.history.AbstractDataSource;
import org.labkey.api.module.Module;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.Formats;

import java.sql.SQLException;

public class DefaultVitalsDataSource extends AbstractDataSource
{
    public DefaultVitalsDataSource(Module module)
    {
        super("study", "Vitals", "Vitals", "Vitals", module);
        setShowTime(true);
    }

    @Override
    protected String getHtml(Container c, Results rs, boolean redacted) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        if (rs.hasColumn(FieldKey.fromString("temp")) && rs.getObject("temp") != null)
        {
            addVital(sb, "Temperature: ", " f", Formats.f1.format(rs.getInt("temp")));
        }

        if (rs.hasColumn(FieldKey.fromString("heartRate")) && rs.getObject("heartRate") != null)
        {
            addVital(sb, "Heart Rate: ", " bpm", Formats.f0.format( rs.getDouble("heartRate")));
        }

        if (rs.hasColumn(FieldKey.fromString("respRate")) && rs.getObject("respRate") != null)
        {
            addVital(sb, "Respiration Rate: ", " rpm", Formats.f0.format(rs.getInt("respRate")));
        }

        return sb.toString();
    }

    private void addVital(StringBuilder sb, String displayLabel, String suffix, String value)
    {
        sb.append(displayLabel);
        sb.append(value);
        sb.append(suffix);
        sb.append("\n");
    }
}
