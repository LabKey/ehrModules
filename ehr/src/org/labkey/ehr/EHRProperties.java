/*
 * Copyright (c) 2010 LabKey Corporation
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
            pd.setLookupSchema("lists");
            pd.setLookupQuery("project");
            pd.setImportAliases("pno");
            return pd;
        }
    };

    static public void register()
    {
        // do nothing
    }
}
