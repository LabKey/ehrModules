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
package org.labkey.ehr_compliancedb.query;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.query.DetailsURL;

/**
 * User: bimber
 * Date: 9/13/13
 * Time: 11:19 AM
 */
public class EHRComplianceTableCustomizer implements TableCustomizer
{
    public void customize(TableInfo table)
    {
        LDKService.get().getDefaultTableCustomizer().customize(table);

        if (table instanceof AbstractTableInfo)
        {
            if (table.getName().equalsIgnoreCase("employees"))
            {
                ((AbstractTableInfo) table).setDetailsURL(DetailsURL.fromString("/ehr_compliancedb/employeeDetails.view?employeeid=${employeeid}"));

                LDKService.get().appendEnddateColumns((AbstractTableInfo)table);
            }
            else if (table.getName().equalsIgnoreCase("requirements"))
            {
                ((AbstractTableInfo) table).setDetailsURL(DetailsURL.fromString("/ehr_compliancedb/requirementDetails.view?requirementname=${requirementname}"));
            }
        }
    }
}
