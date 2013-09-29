package org.labkey.ehr_compliancedb;

import org.apache.log4j.Logger;
import org.labkey.api.action.SpringActionController;

/**
 * User: bimber
 * Date: 9/18/13
 * Time: 2:43 PM
 */
public class EHR_ComplianceDBController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHR_ComplianceDBController.class);
    private static final Logger _log = Logger.getLogger(EHR_ComplianceDBController.class);

    public EHR_ComplianceDBController()
    {
        setActionResolver(_actionResolver);
    }
}
