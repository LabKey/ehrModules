package org.labkey.ehr_app;

import org.labkey.api.action.SpringActionController;

public class EHR_AppController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHR_AppController.class);
    public static final String NAME = "ehr_app";

    public EHR_AppController()
    {
        setActionResolver(_actionResolver);
    }
}
