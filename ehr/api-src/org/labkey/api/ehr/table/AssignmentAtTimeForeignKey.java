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
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;

import java.util.ArrayList;
import java.util.List;

public class AssignmentAtTimeForeignKey extends LookupForeignKey
{
    private static final Logger _log = Logger.getLogger(AssignmentAtTimeForeignKey.class);

    private AbstractTableInfo _tableInfo;
    private ColumnInfo _pkCol;
    private UserSchema _ehrSchema;
    private String _dateColName;
    private String _investLastNameCol;

    public AssignmentAtTimeForeignKey(AbstractTableInfo tableInfo, ColumnInfo pkCol, UserSchema ehrSchema, String dateColName, String investLastNameCol)
    {
        _tableInfo = tableInfo;
        _pkCol = pkCol;
        _ehrSchema = ehrSchema;
        _dateColName = dateColName;
        _investLastNameCol = investLastNameCol;
    }

    public TableInfo getLookupTableInfo()
    {
        final String tableName = _tableInfo.getName();
        final String queryName = _tableInfo.getPublicName();
        final String schemaName = _tableInfo.getPublicSchemaName();
        final UserSchema targetSchema = _tableInfo.getUserSchema();

        String name = tableName + "_assignmentsAtTime";
        QueryDefinition qd = QueryService.get().createQueryDef(targetSchema.getUser(), targetSchema.getContainer(), targetSchema, name);
        qd.setSql("SELECT\n" +
                "sd." + _pkCol.getSelectName() + ",\n" +
                "group_concat(DISTINCT h.project.displayName, chr(10)) as projectsAtTime,\n" +
                "group_concat(DISTINCT h.project.protocol.displayName, chr(10)) as protocolsAtTime,\n" +
                "group_concat(DISTINCT h.project." + _investLastNameCol + ", chr(10)) as investigatorsAtTime,\n" +
                "group_concat(DISTINCT h.project.project, chr(10)) as projectNumbersAtTime\n" +
                "FROM \"" + schemaName + "\".\"" + queryName + "\" sd\n" +
                "JOIN \"" + _ehrSchema.getContainer().getPath() + "\".study.assignment h\n" +
                "  ON (sd.id = h.id AND h.dateOnly <= CAST(sd." + _dateColName + " AS DATE) AND (CAST(sd." + _dateColName + " AS DATE) <= h.enddateCoalesced) AND h.qcstate.publicdata = true)\n" +
                "group by sd." + _pkCol.getSelectName());
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

        ti.getColumn(_pkCol.getName()).setHidden(true);
        ti.getColumn(_pkCol.getName()).setKeyField(true);

        ti.getColumn("projectsAtTime").setLabel("Center Projects At Time");
        ti.getColumn("protocolsAtTime").setLabel("IACUC Protocols At Time");
        ti.getColumn("investigatorsAtTime").setLabel("Investigators At Time");
        ti.getColumn("projectNumbersAtTime").setLabel("Project Numbers At Time");
        ti.getColumn("projectNumbersAtTime").setHidden(true);

        return ti;
    }
}
