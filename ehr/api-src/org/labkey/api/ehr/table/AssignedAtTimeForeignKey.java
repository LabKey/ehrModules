/*
 * Copyright (c) 2018 LabKey Corporation
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
package org.labkey.api.ehr.table;

import org.apache.log4j.Logger;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;

import java.util.ArrayList;
import java.util.List;

public class AssignedAtTimeForeignKey extends LookupForeignKey
{
    private static final Logger _log = Logger.getLogger(AssignedAtTimeForeignKey.class);

    private AbstractTableInfo _tableInfo;
    private ColumnInfo _pkCol;
    private UserSchema _ehrSchema;

    public AssignedAtTimeForeignKey(AbstractTableInfo tableInfo, ColumnInfo pkCol, UserSchema ehrSchema)
    {
        _tableInfo = tableInfo;
        _pkCol = pkCol;
        _ehrSchema = ehrSchema;
    }

    public TableInfo getLookupTableInfo()
    {
        final String tableName = _tableInfo.getName();
        final String queryName = _tableInfo.getPublicName();
        final String schemaName = _tableInfo.getPublicSchemaName();
        final UserSchema targetSchema = _tableInfo.getUserSchema();

        String name = tableName + "_assignedAtTime";
        QueryDefinition qd = QueryService.get().createQueryDef(targetSchema.getUser(), targetSchema.getContainer(), targetSchema, name);
        qd.setSql("SELECT\n" +
                "sd." + _pkCol.getSelectName() + ",\n" +
                "CASE " +
                " WHEN (sd.project IS NULL) THEN NULL " +
                " WHEN (sd.project IN (SELECT a.project FROM \"" + _ehrSchema.getContainer().getPath() + "\".study.assignment a WHERE a.participantid = sd.participantid AND a.date <= sd.date AND (a.enddate IS NULL OR a.enddate >= sd.date))) THEN TRUE" +
                " ELSE FALSE END AS projectAtTime\n" +
                "FROM \"" + schemaName + "\".\"" + queryName + "\" sd");
        qd.setIsTemporary(true);

        List<QueryException> errors = new ArrayList<>();
        TableInfo ti = qd.getTable(errors, true);
        if (errors.size() > 0)
        {
            _log.error("Error creating lookup table for: " + schemaName + "." + queryName + " in container: " + targetSchema.getContainer().getPath());
            for (QueryException error : errors)
            {
                _log.error(error.getMessage(), error);
            }
            return null;
        }

        ((BaseColumnInfo)ti.getColumn(_pkCol.getName())).setHidden(true);
        ((BaseColumnInfo)ti.getColumn(_pkCol.getName())).setKeyField(true);

        ((BaseColumnInfo)ti.getColumn("projectAtTime")).setLabel("Assigned to Center Project At Time");

        return ti;
    }
}
