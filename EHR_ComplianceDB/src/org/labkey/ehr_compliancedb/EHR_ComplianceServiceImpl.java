package org.labkey.ehr_compliancedb;

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.ehr_compliancedb.api.EHR_ComplianceService;

/**
 * Created by jon on 3/22/16.
 */
public class EHR_ComplianceServiceImpl extends EHR_ComplianceService {
    static public String EmployeeContainerPropertyName = "EmployeeContainer";

    @Override
    public String getComplianceModuleName() {
        return EHR_ComplianceDBModule.SCHEMA_NAME;
    }

    @Override
    public Container getEmployeeContainer(Container c) {
        EHR_ComplianceDBModule ehrCompliance = getModule();
        ModuleProperty prop = ehrCompliance.getModuleProperties().get(EmployeeContainerPropertyName);

        String containerPath = PropertyManager.getCoalescedProperty(PropertyManager.SHARED_USER, c, prop.getCategory(), EmployeeContainerPropertyName);

        return ContainerManager.getForPath(containerPath);
    }

    public EHR_ComplianceDBModule getModule() {
        return ModuleLoader.getInstance().getModule(EHR_ComplianceDBModule.class);
    }
}
