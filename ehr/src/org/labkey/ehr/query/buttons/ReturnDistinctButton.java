package org.labkey.ehr.query.buttons;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.SimpleButtonConfigFactory;
import org.labkey.api.module.Module;
import org.labkey.api.study.DataSetTable;
import org.labkey.api.view.template.ClientDependency;

/**
 * User: bimber
 * Date: 7/10/13
 * Time: 8:10 PM
 */
public class ReturnDistinctButton extends SimpleButtonConfigFactory
{
    public ReturnDistinctButton(Module owner)
    {
        super(owner, "Return Distinct Values", "EHR.DatasetButtons.getDistinctHandler(dataRegionName);");
        setClientDependencies(ClientDependency.fromModuleName("ehr"));
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti instanceof DataSetTable;
    }
}
