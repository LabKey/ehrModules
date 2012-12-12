package org.labkey.ehr.table;

import org.labkey.api.data.TableCustomizer;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.ldk.LDKService;

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

        List<TableCustomizer> customizers = EHRService.get().getCustomizers(table.getSchema().getName(), table.getName());
        for (TableCustomizer tc : customizers)
        {
            tc.customize(table);
        }
    }
}
