package org.labkey.viral_load_assay;

import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.laboratory.LaboratoryService;
import org.labkey.api.module.ModuleContext;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 11/9/12
 * Time: 5:10 PM
 */
public class Viral_Load_UpgradeCode implements org.labkey.api.data.UpgradeCode
    {
        @SuppressWarnings({"UnusedDeclaration"})
        public void ensureColumns(final ModuleContext moduleContext)
        {
            try
            {
                LaboratoryService.get().ensureAssayColumns(moduleContext.getUpgradeUser(), Viral_Load_Manager.VL_ASSAY_PROVIDER_NAME);
            }
            catch (ChangePropertyDescriptorException e)
            {
                throw new RuntimeException(e);
            }
        }

    }
