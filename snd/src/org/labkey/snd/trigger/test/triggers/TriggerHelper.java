/*
 * Copyright (c) 2018 LabKey Corporation
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
package org.labkey.snd.trigger.test.triggers;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ValidationException;
import org.labkey.api.snd.AttributeData;
import org.labkey.api.snd.Event;
import org.labkey.api.snd.EventData;
import org.labkey.api.snd.Package;

import java.util.HashMap;
import java.util.Map;

public class TriggerHelper
{
    public static final String orderPropName = "triggerOrder";

    private static Map<String, Integer> ELECTROLYTES_TRIGGER_ORDER = new HashMap<>();

    static {
        ELECTROLYTES_TRIGGER_ORDER.put("Chloride Test Trigger", 0);
        ELECTROLYTES_TRIGGER_ORDER.put("Chloride Blood Test Trigger", 1);
        ELECTROLYTES_TRIGGER_ORDER.put("Electrolytes Test Trigger", 2);
    }

    // Properties can be passed in by name or propertyId. This will get the propertyId from the package for a given
    // attribute name.
    public static Integer getPropertyId(String name, Package pkg)
    {
        Integer propertyId = null;
        for (GWTPropertyDescriptor attribute : pkg.getAttributes())
        {
            if (attribute.getName().equals(name))
            {
                propertyId = attribute.getPropertyId();
                break;
            }
        }

        return propertyId;
    }

    public static AttributeData getAttribute(String name, EventData eventData, Package pkg)
    {
        Integer attributePropId = getPropertyId(name, pkg);

        AttributeData attribute = null;

        for (AttributeData attributeData : eventData.getAttributes())
        {
            if ((attributeData.getPropertyName() != null && attributeData.getPropertyName().equals(name))
                    || (attributePropId != null && attributeData.getPropertyId() == attributePropId))
            {
                attribute = attributeData;
            }
        }

        return attribute;
    }

    public static void setAttributeValue(EventData eventData, @Nullable Integer propertyId, @Nullable String propertyName, String value)
    {
        for (AttributeData attributeData : eventData.getAttributes())
        {
            if ((attributeData.getPropertyName() != null && attributeData.getPropertyName().equals(propertyName))
                    || (propertyId != null && attributeData.getPropertyId() == propertyId))
            {
                attributeData.setValue(value);
            }
        }
    }

    public static void saveAttributeData(EventData eventData, String propertyName, String propertyValue)
    {
        boolean found = false;
        for (AttributeData attributeData : eventData.getAttributes())
        {
            if ((attributeData.getPropertyName() != null && attributeData.getPropertyName().equals(propertyName)))
            {
                attributeData.setValue(propertyValue);
                found = true;
                break;
            }
        }

        if (!found)
        {
            eventData.getAttributes().add(new AttributeData(propertyName, null, propertyValue));
        }
    }

    public static void ensureTriggerOrder(Event event, String name, Map<String, Object> extraContext)
    {
        if (ELECTROLYTES_TRIGGER_ORDER.get(name) == null)
        {
            event.setException(new ValidationException(name + ": Did not find trigger order defined in TriggerHelper.TRIGGER_ORDER", ValidationException.SEVERITY.ERROR));
        }

        Integer orderFound = (Integer) extraContext.get(TriggerHelper.orderPropName);
        if (orderFound == null)
        {
            if (ELECTROLYTES_TRIGGER_ORDER.get(name) == 0)
            {
                extraContext.put(TriggerHelper.orderPropName, 0);
            }
            else
            {
                event.setException(new ValidationException(name + ": Executing out of order. Expected order " + ELECTROLYTES_TRIGGER_ORDER.get(name) + " but was 0", ValidationException.SEVERITY.ERROR));
            }
        }
        else
        {
            if (orderFound != ELECTROLYTES_TRIGGER_ORDER.get(name) - 1)
            {
                event.setException(new ValidationException(name + ": Executing out of order. Expected order " + (ELECTROLYTES_TRIGGER_ORDER.get(name) - 1) + " but was " + orderFound, ValidationException.SEVERITY.ERROR));
            }
            else
            {
                extraContext.put(TriggerHelper.orderPropName, ELECTROLYTES_TRIGGER_ORDER.get(name));
            }
        }
    }
}
