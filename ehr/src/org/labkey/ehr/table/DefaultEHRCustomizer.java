/*
 * Copyright (c) 2012 LabKey Corporation
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

import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.DataSetTable;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 12/7/12
 * Time: 2:29 PM
 */
public class DefaultEHRCustomizer implements TableCustomizer
{
    public DefaultEHRCustomizer()
    {

    }

    public void customize(TableInfo table)
    {
        LDKService.get().getBuiltInColumnsCustomizer().customize(table);

        if (table instanceof DataSetTable)
        {
            customizeDataset((DataSetTable)table);
        }

        //this should execute after any default EHR code
        List<TableCustomizer> customizers = EHRService.get().getCustomizers(table.getSchema().getName(), table.getName());
        for (TableCustomizer tc : customizers)
        {
            tc.customize(table);
        }
    }

    private void customizeDataset(DataSetTable ds)
    {

    }
}
