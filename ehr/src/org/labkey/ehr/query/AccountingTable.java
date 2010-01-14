package org.labkey.ehr.query;

import java.util.ArrayList;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.*;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.security.User;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.ehr.EHRSchema;

import java.util.List;
import java.util.Map;

/**
 * Copyright (c) 2006-2009 LabKey Corporation
 * <p/>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p/>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p/>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * <p/>
 * User: brittp
 * Date: Jan 6, 2010 4:35:44 PM
 */
public class AccountingTable extends AbstractTableInfo
{
    static final String[] COLUMN_NAMES = new String[] {
            "ParticipantID",
            "SequenceNum",
            "Date",
    };

    private Container _container;
    private User _user;

    public AccountingTable(EHRQuerySchema schema)
    {
        super(schema.getDbSchema());
        _container = schema.getContainer();
        _user = schema.getUser();

        setName("Accounting");
        initColumns();
    }

    private void initColumns()
    {
        List<ColumnInfo> columns = new ArrayList<ColumnInfo>(COLUMN_NAMES.length);

        Study study = StudyService.get().getStudy(_container);
        if (study != null)
        {
            DataSet[] datasets = study.getDataSets();
            if (datasets != null)
            {
                for (int i = 0; i < datasets.length; i++)
                {
                    DataSet dataset = datasets[i];
                    if (!dataset.canRead(_user))
                        continue;

                    TableInfo tableInfo = dataset.getTableInfo(_user);
                    List<ColumnInfo> cols = tableInfo.getColumns(COLUMN_NAMES);
                    if (cols != null && cols.size() > 0)
                    {
                        for (ColumnInfo col : cols)
                        {
                            if (col != null)
                            {
                                ColumnInfo newCol = new ColumnInfo(col, this);
                                addColumn(newCol);
                            }
                        }
                        break;
                    }
                }
            }
        }
    }



    @NotNull
    public SQLFragment getFromSQL()
    {

        SQLFragment sql = new SQLFragment();

        Study study = StudyService.get().getStudy(_container);
        if (study != null)
        {
            DataSet[] datasets = study.getDataSets();
            if (datasets != null)
            {
                for (int i = 0; i < datasets.length; i++)
                {
                    DataSet dataset = datasets[i];
                    if (!dataset.canRead(_user))
                        continue;

                    sql.append("SELECT ");
                    TableInfo tableInfo = dataset.getTableInfo(_user);
                    List<ColumnInfo> columns = tableInfo.getColumns(COLUMN_NAMES);
                    String sep = "";
                    for (ColumnInfo column : columns)
                    {
                        if (column == null)
                            sql.append(sep).append("NULL");
                        else
                            sql.append(sep).append("x.").append(column.getSelectName());
                        sep = ", ";
                    }
                    sql.append(" FROM (").append(tableInfo.getFromSQL()).append(") AS x");

                    if (i+1 < datasets.length)
                        sql.append("\nUNION\n");
                }
            }
        }

        return sql;
    }
}
