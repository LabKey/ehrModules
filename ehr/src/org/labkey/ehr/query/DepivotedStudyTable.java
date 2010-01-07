package org.labkey.ehr.query;

import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.study.DataSet;
import org.labkey.api.exp.OntologyManager;

import java.sql.Types;
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
 * Date: Jan 6, 2010 2:00:58 PM
 */
public class DepivotedStudyTable extends FilteredTable
{
    public DepivotedStudyTable(DataSet dataset)
    {
        super(OntologyManager.getTinfoObjectProperty(), dataset.getContainer());

        addColumn(new StudyDataColumn(this, dataset, "Subject", "ParticipantId", Types.VARCHAR, "Subject ID for this data value"));
        addColumn(new StudyDataColumn(this, dataset, "Date", "_visitdate", Types.DATE, "Collection date for this data value"));
        addColumn(new StudyDataColumn(this, dataset, "DatasetId", "DatasetId", Types.INTEGER, "Dataset ID for this data value"));
        addColumn(new PropertyDescriptorColumn(this, "PropertyName", "name", Types.VARCHAR, "Data property name"));
        addColumn(new PropertyDescriptorColumn(this, "PropertyLabel", "label", Types.VARCHAR, "Data property label"));
        addColumn(new PropertyDescriptorColumn(this, "PropertyDescription", "description", Types.VARCHAR, "Data property description"));

        String varcharType = getSqlDialect().sqlTypeNameFromSqlTypeInt(Types.VARCHAR);
        SQLFragment stringValueSql = new SQLFragment("CASE " + ExprColumn.STR_TABLE_ALIAS + ".TypeTag \n" +
                "\t\tWHEN 'f' THEN CAST(" + ExprColumn.STR_TABLE_ALIAS + ".FloatValue AS " + varcharType + ") \n" +
                "\t\tWHEN 's' THEN " + ExprColumn.STR_TABLE_ALIAS + ".StringValue\n" +
                "\t\tWHEN 'd' THEN CAST(" + ExprColumn.STR_TABLE_ALIAS + ".DateTimeValue AS " + varcharType + ") \n" +
                "\tEND");
        addColumn(new ExprColumn(this, "Value", stringValueSql, Types.VARCHAR));

        addWrapColumn(_rootTable.getColumn("FloatValue"));
        addWrapColumn(_rootTable.getColumn("DateTimeValue"));
        addWrapColumn(_rootTable.getColumn("StringValue"));
        addWrapColumn(_rootTable.getColumn("MVIndicator"));
       }

    private class StudyDataColumn extends ExprColumn
    {
        protected static final String STUDY_DATA_JOIN = "StudyDataJoin";
        private DataSet _dataset;

        public StudyDataColumn(TableInfo parent, DataSet dataset, String name, String selectCol, int sqlType, String description)
        {
            super(parent, name, new SQLFragment(ExprColumn.STR_TABLE_ALIAS + "$" + STUDY_DATA_JOIN + "." + selectCol), sqlType);
            setDescription(description);
            _dataset = dataset;
        }

        @Override
        public void declareJoins(String parentAlias, Map<String, SQLFragment> map)
        {
            super.declareJoins(parentAlias, map);

            String tableAlias = parentAlias + "$" + STUDY_DATA_JOIN;
            if (map.containsKey(tableAlias))
                return;

            SQLFragment joinSql = new SQLFragment();
            joinSql.append(" JOIN ").append(OntologyManager.getTinfoObject()).append(" ON ");
            joinSql.append(parentAlias).append(".objectId = ").append(OntologyManager.getTinfoObject()).append(".objectid\n");
            joinSql.append(" AND ").append(OntologyManager.getTinfoObject()).append(".Container = ?\n");
            joinSql.add(getContainer());
            joinSql.append(" JOIN study.StudyData AS ").append(tableAlias).append(" ON ");
            joinSql.append(OntologyManager.getTinfoObject()).append(".objecturi = ").append(tableAlias).append(".lsid");
            joinSql.append(" AND ").append(tableAlias).append(".datasetid = ? AND ").append(tableAlias).append(".Container = ?");
            joinSql.add(_dataset.getDataSetId());
            joinSql.add(_dataset.getContainer());

            map.put(tableAlias, joinSql);
        }
    }

    private class PropertyDescriptorColumn extends ExprColumn
    {
        protected static final String PROPERTY_DESC_JOIN = "PropertyDescriptorJoin";

        public PropertyDescriptorColumn(TableInfo parent, String name, String selectColumn, int sqlType, String description)
        {
            super(parent, name, new SQLFragment(ExprColumn.STR_TABLE_ALIAS + "$" + PROPERTY_DESC_JOIN + "." + selectColumn), sqlType);
            setDescription(description);
        }

        @Override
        public void declareJoins(String parentAlias, Map<String, SQLFragment> map)
        {
            super.declareJoins(parentAlias, map);

            String tableAlias = parentAlias + "$" + PROPERTY_DESC_JOIN;
            if (map.containsKey(tableAlias))
                return;

            SQLFragment joinSql = new SQLFragment();
            joinSql.append(" JOIN ").append(OntologyManager.getTinfoPropertyDescriptor()).append(" AS ");
            joinSql.append(tableAlias).append(" ON ");
            joinSql.append(parentAlias).append(".propertyId = ").append(tableAlias).append(".propertyid");

            map.put(tableAlias, joinSql);
        }
    }
}