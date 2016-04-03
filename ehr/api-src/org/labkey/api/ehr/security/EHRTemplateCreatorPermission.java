package org.labkey.api.ehr.security;

/**
 * Created by Josh on 2/25/2016.
 */
public class EHRTemplateCreatorPermission extends AbstractEHRPermission
{
    public EHRTemplateCreatorPermission()
    {
        super("EHRTemplateCreatorPermission", "Shows EHR users the 'Save As Template' button in many data entry UIs.");
    }
}
