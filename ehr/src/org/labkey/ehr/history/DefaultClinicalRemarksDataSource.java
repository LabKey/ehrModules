/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.history;

import org.labkey.api.data.Results;

import java.sql.SQLException;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 2/17/13
 * Time: 4:52 PM
 */
public class DefaultClinicalRemarksDataSource extends AbstractDataSource
{
    public DefaultClinicalRemarksDataSource()
    {
        super("study", "Clinical Remarks", "Clinical Remark");
    }

    @Override
    protected String getHtml(Results rs) throws SQLException
    {
        StringBuilder sb = new StringBuilder();

        sb.append(safeAppend(rs, "Hx", "hx"));
        sb.append(safeAppend(rs, "S/O", "so"));
        sb.append(safeAppend(rs, "S", "s"));
        sb.append(safeAppend(rs, "O", "o"));
        sb.append(safeAppend(rs, "A", "a"));
        sb.append(safeAppend(rs, "P", "p"));
        sb.append(safeAppend(rs, "P2", "p2"));
        sb.append(safeAppend(rs, "Other Remark", "remark"));

        return sb.toString();
    }
}
