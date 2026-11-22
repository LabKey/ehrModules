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
import org.labkey.api.collections.CaseInsensitiveHashSet;
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
import java.util.Set;

/**
 * Multi-valued lookups to the projects (study.assignment) and protocols (study.protocolAssignment) an animal held on
 * each record's date. The protocol comes from protocolAssignment, not assignment.project.protocol, for centers that
 * assign the two independently.
 */
public final class AssignmentAtTimeColumns
{
    private static final Logger LOG = LogHelper.getLogger(AssignmentAtTimeColumns.class, "Project and protocol at time lookup columns");

    public enum AtTimeColumn
    {
        PROJECT("projectAtTime", "Project At Time", "assignment", "project"),
        PROTOCOL("protocolAtTime", "Protocol At Time", "protocolAssignment", "protocol");

        private final String _name;
        private final String _label;
        private final String _sourceDataset;
        private final String _valueCol;

        AtTimeColumn(String name, String label, String sourceDataset, String valueCol)
        {
            _name = name;
            _label = label;
            _sourceDataset = sourceDataset;
            _valueCol = valueCol;
        }
    }

    private AssignmentAtTimeColumns()
    {
    }

    public static void addAtTimeCols(@NotNull AbstractTableInfo ds, @NotNull UserSchema ehrStudySchema, @NotNull AtTimeColumn... cols)
    {
        if (ds.getColumn("Id") == null || ds.getColumn("date") == null || !"study".equalsIgnoreCase(ds.getPublicSchemaName()))
            return;

        UserSchema targetSchema = ds.getUserSchema();
        if ("demographics".equalsIgnoreCase(ds.getName()) || ds.getPkColumns().size() != 1 || targetSchema == null)
            return;

        Set<String> ehrStudyTables = null;
        for (AtTimeColumn col : cols)
        {
            if (ds.getColumn(col._name, false) != null || col._sourceDataset.equalsIgnoreCase(ds.getName()))
                continue;

            if (ehrStudyTables == null)
                ehrStudyTables = new CaseInsensitiveHashSet(ehrStudySchema.getTableNames());

            if (ehrStudyTables.contains(col._sourceDataset))
                addAtTimeLookupCol(ds, targetSchema, ehrStudySchema, col);
        }
    }

    private static void addAtTimeLookupCol(AbstractTableInfo ds, UserSchema targetSchema, UserSchema ehrStudySchema, AtTimeColumn atTimeCol)
    {
        final ColumnInfo pkCol = ds.getPkColumns().getFirst();
        final String schemaName = ds.getPublicSchemaName();
        final String queryName = ds.getName();
        final String ehrPath = ehrStudySchema.getContainer().getPath();
        final String name = atTimeCol._name;
        final String valueCol = atTimeCol._valueCol;

        WrappedColumn col = new WrappedColumn(pkCol, name);
        col.setLabel(atTimeCol._label);
        col.setReadOnly(true);
        col.setUserEditable(false);
        // The junction's value column keeps the source dataset's lookup, which the multi-valued FK resolves through to
        // the target's title column; values with no matching target row are dropped.
        col.setFk(new MultiValuedForeignKey(new LookupForeignKey(pkCol.getName())
        {
            @Override
            public TableInfo getLookupTableInfo()
            {
                QueryDefinition qd = QueryService.get().createQueryDef(targetSchema.getUser(), targetSchema.getContainer(), targetSchema, queryName + "_" + name);
                // Full timestamps with an exclusive end, like housingAtTime; AssignmentAtTimeForeignKey matches by date instead.
                // The source is pinned to the EHR container so the dataset's container filter doesn't widen it.
                qd.setSql("SELECT DISTINCT\n" +
                        "sd." + pkCol.getFieldKey().toSQLString() + ",\n" +
                        "src." + valueCol + "\n" +
                        "FROM \"" + schemaName + "\".\"" + queryName + "\" sd\n" +
                        "JOIN \"" + ehrPath + "\".study." + atTimeCol._sourceDataset + "[ContainerFilter='Current'] src\n" +
                        "  ON (src.id = sd.id AND src.date <= sd.date\n" +
                        "  AND (src.enddate IS NULL OR sd.date < src.enddate)\n" +
                        "  AND src.qcstate.publicdata = true)");
                qd.setIsTemporary(true);
                qd.setContainerFilter(ds.getContainerFilter());

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
        }, valueCol));

        ds.addColumn(col);
    }
}
