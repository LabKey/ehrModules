/*
 * Copyright (c) 2013-2019 LabKey Corporation
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
package org.labkey.ehr_compliancedb;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.labkey.api.action.SpringActionController;

/**
 * User: bimber
 * Date: 9/18/13
 * Time: 2:43 PM
 */
public class EHR_ComplianceDBController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHR_ComplianceDBController.class);
    private static final Logger _log = LogManager.getLogger(EHR_ComplianceDBController.class);

    public EHR_ComplianceDBController()
    {
        setActionResolver(_actionResolver);
    }
}
