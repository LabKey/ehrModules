/*
 * Copyright (c) 2020-2026 LabKey Corporation
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
package org.labkey.ehr_compliancedb.api;

import org.labkey.api.data.Container;

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
