/*
 * Copyright (c) 2026 LabKey Corporation
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

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.MultiValuedForeignKey;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryDefinition;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.util.logging.LogHelper;

import java.util.ArrayList;
import java.util.List;

/**
 * Multi-valued lookups to the projects (study.assignment) and protocols (study.protocolAssignment) an animal held on
 * each record's date. The protocol comes from protocolAssignment, not assignment.project.protocol, for centers that
 * assign the two independently.
 */
public final class AssignmentAtTimeColumns
{
    private static final Logger LOG = LogHelper.getLogger(AssignmentAtTimeColumns.class, "Project and protocol at time lookup columns");

    public static final String PROJECT_AT_TIME = "projectAtTime";
    public static final String PROTOCOL_AT_TIME = "protocolAtTime";

    private AssignmentAtTimeColumns()
    {
    }

    public static void addProjectAtTimeCol(@NotNull AbstractTableInfo ds, @NotNull UserSchema ehrStudySchema)
    {
        addAtTimeLookupCol(ds, ehrStudySchema, PROJECT_AT_TIME, "Project At Time", "assignment", "project", "name");
    }

    public static void addProtocolAtTimeCol(@NotNull AbstractTableInfo ds, @NotNull UserSchema ehrStudySchema)
    {
        addAtTimeLookupCol(ds, ehrStudySchema, PROTOCOL_AT_TIME, "Protocol At Time", "protocolAssignment", "protocol", "title");
    }

    private static void addAtTimeLookupCol(AbstractTableInfo ds, UserSchema ehrStudySchema, String name, String label,
                                           String sourceDataset, String valueCol, String displayField)
    {
        if (ds.getColumn(name, false) != null || ds.getColumn("Id") == null || ds.getColumn("date") == null)
            return;

        if ("demographics".equalsIgnoreCase(ds.getName()) && "study".equalsIgnoreCase(ds.getPublicSchemaName()))
            return;

        List<ColumnInfo> pks = ds.getPkColumns();
        final UserSchema targetSchema = ds.getUserSchema();
        if (pks.size() != 1 || targetSchema == null)
            return;

        if (ehrStudySchema.getTableNames().stream().noneMatch(sourceDataset::equalsIgnoreCase))
            return;

        final ColumnInfo pkCol = pks.getFirst();
        final String schemaName = ds.getPublicSchemaName();
        final String queryName = ds.getName();
        final String ehrPath = ehrStudySchema.getContainer().getPath();

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel(label);
        col.setReadOnly(true);
        col.setUserEditable(false);
        // The junction's value column keeps the source dataset's lookup, which the multi-valued FK resolves through;
        // values with no matching target row are dropped.
        col.setFk(new MultiValuedForeignKey(new LookupForeignKey(pkCol.getName())
        {
            @Override
            public TableInfo getLookupTableInfo()
            {
                QueryDefinition qd = QueryService.get().createQueryDef(targetSchema.getUser(), targetSchema.getContainer(), targetSchema, queryName + "_" + name);
                // Date precision with an inclusive end, matching AssignmentAtTimeForeignKey.
                qd.setSql("SELECT DISTINCT\n" +
                        "sd." + pkCol.getFieldKey().toSQLString() + ",\n" +
                        "src." + valueCol + "\n" +
                        "FROM \"" + schemaName + "\".\"" + queryName + "\" sd\n" +
                        "JOIN \"" + ehrPath + "\".study." + sourceDataset + " src\n" +
                        "  ON (src.id = sd.id AND CAST(src.date AS DATE) <= CAST(sd.date AS DATE)\n" +
                        "  AND (src.enddate IS NULL OR CAST(sd.date AS DATE) <= CAST(src.enddate AS DATE))\n" +
                        "  AND src.qcstate.publicdata = true)");
                qd.setIsTemporary(true);

                List<QueryException> errors = new ArrayList<>();
                TableInfo ti = qd.getTable(errors, true);
                if (!errors.isEmpty() || ti == null)
                {
                    LOG.warn("Error creating {} junction for: {}.{} in container: {}", name, schemaName, queryName, targetSchema.getContainer().getPath());
                    errors.forEach(e -> LOG.error("Lookup table QueryException: {}", e.getMessage(), e));
                    return null;
                }

                ((BaseColumnInfo) ti.getColumn(pkCol.getName())).setKeyField(true);
                return ti;
            }
        }, valueCol, displayField));

        ds.addColumn(col);
    }
}
