package org.labkey.ehr_compliancedb.api;

import org.labkey.api.data.Container;

/**
 * Created by jon on 3/22/16.
 */
public abstract class EHR_ComplianceService {
    static private EHR_ComplianceService _service = null;

    static public EHR_ComplianceService get() {
        return _service;
    }

    public static void setInstance(EHR_ComplianceService instance) {
        _service = instance;
    }

    public abstract String getComplianceModuleName();

    public abstract Container getEmployeeContainer(Container c);
}
