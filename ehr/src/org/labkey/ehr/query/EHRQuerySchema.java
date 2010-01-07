package org.labkey.ehr.query;

import org.labkey.api.query.*;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.security.User;
import org.labkey.api.study.StudyService;
import org.labkey.api.study.Study;
import org.labkey.api.study.DataSet;
import org.labkey.ehr.EHRSchema;

import java.util.Set;
import java.util.HashSet;

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
        super(SCHEMA_NAME, SCHEMA_DESCRIPTION, user, c, EHRSchema.getInstance().getSchema());
    }

    protected TableInfo createTable(String name)
    {
        if (name.equalsIgnoreCase("Accounting"))
            return new AccountingTable(getContainer());
        Study study = StudyService.get().getStudy(getContainer());
        if (study != null)
        {
            DataSet[] datasets = study.getDataSets();
            if (datasets != null)
            {
                for (DataSet dataset : datasets)
                {
                    if (dataset.getName().equalsIgnoreCase(name))
                        return new WrappedStudyTable(dataset.getTableInfo(getUser()), getContainer());
                    else if (getDepivotName(dataset.getName()).equalsIgnoreCase(name))
                        return new DepivotedStudyTable(dataset);
                }
            }
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
        tableNames.add("Accounting");
        Study study = StudyService.get().getStudy(getContainer());
        if (study != null)
        {
            DataSet[] datasets = study.getDataSets();
            if (datasets != null)
            {
                for (DataSet dataset : datasets)
                {
                    tableNames.add(dataset.getName());
                    tableNames.add(getDepivotName(dataset.getName()));
                }
            }
        }
        return tableNames;
    }
}
