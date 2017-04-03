package org.labkey.viral_load_assay;

import org.labkey.api.module.ModuleContext;
import org.labkey.api.study.assay.AssayService;

/**
 * User: bimber
 * Date: 11/9/12
 * Time: 5:10 PM
 */
public class Viral_Load_UpgradeCode implements org.labkey.api.data.UpgradeCode
{
    @SuppressWarnings({"UnusedDeclaration"})
    public void ensureColumns(final ModuleContext moduleContext)
    {
        // Test early loading of module assay providers. This will be removed once converted to a module resource cache.
        AssayService.get().getAssayProviders();
    }
}
