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
public class JumpToHistoryButton extends SimpleButtonConfigFactory
{
    public JumpToHistoryButton(Module owner)
    {
        super(owner, "Jump To History", "EHR.DatasetButtons.historyHandler(dataRegion, dataRegionName);");
        setClientDependencies(ClientDependency.fromModuleName("ehr"));
    }

    public boolean isAvailable(TableInfo ti)
    {
        return super.isAvailable(ti) && ti instanceof DataSetTable;
    }
}
