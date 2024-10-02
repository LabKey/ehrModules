/*
 * Copyright (c) 2018-2019 LabKey Corporation
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
package org.labkey.api.ehr.notification;

import org.apache.commons.lang3.time.DateUtils;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.Container;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.PropertyManager.WritablePropertyMap;
import org.labkey.api.ldk.notification.AbstractNotification;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;

import java.util.Date;
import java.util.Map;

/**
 * User: bimber
 * Date: 12/19/12
 * Time: 7:32 PM
 */
abstract public class AbstractEHRNotification extends AbstractNotification
{
    protected final static String lastSave = "lastSave";

    public AbstractEHRNotification()
    {
        super(null);
    }

    public AbstractEHRNotification(Module owner)
    {
        super(owner);
    }

    @Override
    public boolean isAvailable(Container c)
    {
        if (getOwnerModule() != null)
            return c.getActiveModules().contains(getOwnerModule());

        if (!c.getActiveModules().contains(ModuleLoader.getInstance().getModule("EHR")))
            return false;

        if (StudyService.get().getStudy(c) == null)
            return false;

        return true;
    }

    protected UserSchema getUserSchemaByName(Container c, User u, String schemaName)
    {
        return QueryService.get().getUserSchema(u, c, schemaName);
    }

    protected UserSchema getStudySchema(Container c, User u)
    {
        return getUserSchemaByName(c, u, "study");
    }

    protected UserSchema getEHRSchema(Container c, User u)
    {
        return getUserSchemaByName(c, u, "ehr");
    }

    protected UserSchema getEHRLookupsSchema(Container c, User u)
    {
        return getUserSchemaByName(c, u, "ehr_lookups");
    }

    protected Study getStudy(Container c)
    {
        return StudyService.get().getStudy(c);
    }

    @Override
    public String getCategory()
    {
        return "EHR";
    }

    @Override
    public String getCronString()
    {
        return null; //"0 0/5 * * * ?";
    }

    protected Map<String, String> getSavedValues(Container c)
    {
        return PropertyManager.getProperties(c, getClass().getName());
    }

    protected void saveValues(Container c, Map<String, String> newValues)
    {
        WritablePropertyMap map = PropertyManager.getWritableProperties(c, getClass().getName(), true);

        Long lastSaveMills = map.containsKey(lastSave) ? Long.parseLong(map.get(lastSave)) : null;

        //if values have already been cached for this alert on this day, dont re-cache them.
        if (lastSaveMills != null)
        {
            if (DateUtils.isSameDay(new Date(), new Date(lastSaveMills)))
            {
                return;
            }
        }

        newValues.put(lastSave, String.valueOf(new Date().getTime()));
        map.putAll(newValues);
        // Used in creating a cache-structure for LabKey-generated notifications. Does not constitute a CSRF vulnerability.
        try (var ignored = SpringActionController.ignoreSqlUpdates())
        {
            map.save();
        }
    }

    protected String getParameterUrlString(Container c, Map<String, Object> params)
    {
        StringBuilder sb = new StringBuilder();
        for (String key : params.keySet())
        {
            sb.append("&query.param.").append(key).append("=");
            if (params.get(key) instanceof Date)
            {
                sb.append(getDateFormat(c).format(params.get(key)));
            }
            else
            {
                sb.append(params.get(key));
            }
        }


        return sb.toString();
    }
}
