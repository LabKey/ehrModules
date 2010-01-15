package org.labkey.ehr;

import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.PropertyType;
import org.labkey.api.exp.property.SystemProperty;

/**
 * User: kevink
 * Date: Jan 12, 2010 5:57:14 PM
 */
public class EHRProperties
{
    static private String URI = "urn:ehr.labkey.org/#";

    public static SystemProperty REMARK = new SystemProperty(URI + "Remark", PropertyType.STRING);
    public static SystemProperty DESCRIPTION = new SystemProperty(URI + "Description", PropertyType.STRING);
    public static SystemProperty ACCOUNT = new SystemProperty(URI + "Account", PropertyType.STRING);
    public static SystemProperty PROJECT = new SystemProperty(URI + "Project", PropertyType.STRING)
    {
        @Override
        protected PropertyDescriptor constructPropertyDescriptor()
        {
            PropertyDescriptor pd = super.constructPropertyDescriptor();
            pd.setImportAliases("pno");
            return pd;
        }
    };

    static public void register()
    {
        // do nothing
    }
}
