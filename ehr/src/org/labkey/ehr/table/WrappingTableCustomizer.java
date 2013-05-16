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
package org.labkey.ehr.table;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.WrappedColumn;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.UserSchema;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 4/22/13
 * Time: 6:42 PM
 */
public class WrappingTableCustomizer implements TableCustomizer
{
    private static final String ID_FIELD = "Id";

    public WrappingTableCustomizer()
    {

    }

    public void customize(TableInfo table)
    {
        DefaultEHRCustomizer ehr = new DefaultEHRCustomizer();
        addLookups(table, ehr);

        ehr.customize(table);
    }

    public void addLookups(TableInfo ti, DefaultEHRCustomizer ehr)
    {
        for (ColumnInfo col : ti.getColumns())
        {
            if (col.getName().equalsIgnoreCase(ID_FIELD) && col.getJdbcType().equals(JdbcType.VARCHAR) && col.getFk() == null)
            {
                //TODO: switch approach when in 13.1
                if (ti instanceof AbstractTableInfo)
                {
                    //TODO: use correct container.  look up using module properties
                    //Container study = EHRService.get().getEHRStudyContainer();
                    UserSchema us = ehr.getStudyUserSchema((AbstractTableInfo)ti);
                    if (us != null)
                    {
                        WrappedColumn newCol = new WrappedColumn(col, "EHR");
                        newCol.setIsUnselectable(true);
                        newCol.setLabel("EHR");
                        newCol.setUserEditable(false);
                        newCol.setFk(new QueryForeignKey(us, "Animal", ID_FIELD, ID_FIELD));
                        if (ti instanceof AbstractTableInfo)
                            ((AbstractTableInfo) ti).addColumn(newCol);
                    }
                }
            }
        }
    }
}
