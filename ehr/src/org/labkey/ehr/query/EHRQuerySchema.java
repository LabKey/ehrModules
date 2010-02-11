package org.labkey.ehr.query;

import org.labkey.api.query.*;
import org.labkey.api.data.*;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;
import org.labkey.api.study.Study;
import org.labkey.api.study.DataSet;
import org.labkey.ehr.EHRSchema;

import java.util.Set;
import java.util.HashSet;
import java.util.Map;

/**
 * Copyright (c) 2010 LabKey Corporation
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
 * Date: Jan 6, 2010 2:58:24 PM
 */

public class EHRQuerySchema extends UserSchema
{
    public static final String SCHEMA_NAME = "EHR";
    private static final String DEPIVOT_NAME_SUFFIX = " Values";
    public static final String SCHEMA_DESCRIPTION = "Contains all data related to electronic health records.";

    static public void register()
    {
        DefaultSchema.registerProvider(SCHEMA_NAME, new DefaultSchema.SchemaProvider() {
            public QuerySchema getSchema(DefaultSchema schema)
            {
                return new EHRQuerySchema(schema.getContainer(), schema.getUser());
            }
        });
    }

    public EHRQuerySchema(Container c, User user)
    {
        super(SCHEMA_NAME, SCHEMA_DESCRIPTION, user, c, DbSchema.get("study"));
    }

    protected TableInfo createTable(String name)
    {
        Study study = StudyService.get().getStudy(getContainer());
        if (study != null)
        {
            if (name.equalsIgnoreCase("StudyData"))
                return QueryService.get().getUserSchema(getUser(), getContainer(), "study").getTable("StudyData");

            DataSet[] datasets = study.getDataSets();
            if (datasets != null)
            {
                for (DataSet dataset : datasets)
                {
                    if (dataset.getLabel().equalsIgnoreCase(name))
                        return dataset.getTableInfo(getUser());
                    else if (getDepivotName(dataset.getLabel()).equalsIgnoreCase(name))
                        return new DepivotedStudyTable(this, dataset);
                }
            }
        }

        UserSchema listSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "lists");
        TableInfo listTable = listSchema.getTable(name);
        if (listTable != null)
        {
            // Wrapping this table doesn't work, since the listTable columns implement 'getValueSQL', and wrapped columns
            // don't pass this call through.
            return listTable; //new WrappedTable(listTable,  getContainer());
        }
        return null;
    }

    private String getDepivotName(String datasetName)
    {
        return datasetName + DEPIVOT_NAME_SUFFIX;
    }

    public Set<String> getTableNames()
    {
        Set<String> tableNames = new HashSet<String>();
        Study study = StudyService.get().getStudy(getContainer());
        if (study != null)
        {
            tableNames.add("StudyData");

            DataSet[] datasets = study.getDataSets();
            if (datasets != null)
            {
                for (DataSet dataset : datasets)
                {
                    if (dataset.canRead(getUser()))
                    {
                        tableNames.add(dataset.getLabel());
                        tableNames.add(getDepivotName(dataset.getLabel()));
                    }
                }
            }
        }

        UserSchema listSchema = QueryService.get().getUserSchema(getUser(), getContainer(), "lists");
        if (listSchema != null)
            tableNames.addAll(listSchema.getTableNames());

        return tableNames;
    }

}
