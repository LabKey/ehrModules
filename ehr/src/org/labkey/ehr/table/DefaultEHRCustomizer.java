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
