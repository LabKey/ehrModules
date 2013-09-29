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
