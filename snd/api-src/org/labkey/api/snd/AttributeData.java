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
package org.labkey.api.snd;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;

/**
 * Class for attribute data and related methods. Used in EventData class
 */
public class AttributeData
{
    private int _propertyId = -1;
    private String _propertyName;
    private GWTPropertyDescriptor _propertyDescriptor;
    private String _value;
    private ValidationException _exception;

    public static final String ATTRIBUTE_DATA_PROPERTY_ID = "propertyId";
    public static final String ATTRIBUTE_DATA_PROPERTY_NAME = "propertyName";
    public static final String ATTRIBUTE_DATA_PROPERTY_DESCRIPTOR = "propertyDescriptor";
    public static final String ATTRIBUTE_DATA_VALUE = "value";

    public static final String ATTRIBUTE_DATA_CSS_CLASS = "snd-attribute-data";

    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";  // ISO8601 w/24-hour time and 'T' character
    public static final String DATE_FORMAT = "yyyy-MM-dd";  // ISO8601

    public AttributeData(int propertyId, @Nullable GWTPropertyDescriptor propertyDescriptor, @Nullable String value)
    {
        _propertyId = propertyId;
        _propertyDescriptor = propertyDescriptor;
        _value = value;
    }

    public AttributeData(String propertyName, @Nullable GWTPropertyDescriptor propertyDescriptor, @Nullable String value)
    {
        _propertyName = propertyName;
        _propertyDescriptor = propertyDescriptor;
        _value = value;
    }

    public AttributeData()
    {}

    public int getPropertyId()
    {
        return _propertyId;
    }

    public void setPropertyId(int propertyId)
    {
        _propertyId = propertyId;
    }

    public String getPropertyName()
    {
        return _propertyName;
    }

    public void setPropertyName(String propertyName)
    {
        _propertyName = propertyName;
    }

    public ValidationException getException()
    {
        return _exception;
    }

    public void setException(Event event, ValidationException exception)
    {
        _exception = exception;
        event.updateExceptionCount(exception);
    }

    @Nullable
    public GWTPropertyDescriptor getPropertyDescriptor()
    {
        return _propertyDescriptor;
    }

    public void setPropertyDescriptor(GWTPropertyDescriptor propertyDescriptor)
    {
        _propertyDescriptor = propertyDescriptor;
    }

    @Nullable
    public String getValue()
    {
        return _value;
    }

    public void setValue(String value)
    {
        _value = value;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        if (getPropertyId() != 0)
            json.put(ATTRIBUTE_DATA_PROPERTY_ID, getPropertyId());

        if (getPropertyName() != null)
            json.put(ATTRIBUTE_DATA_PROPERTY_NAME, getPropertyName());

        if (getPropertyDescriptor() != null)
            json.put(ATTRIBUTE_DATA_PROPERTY_DESCRIPTOR, SNDService.get().convertPropertyDescriptorToJson(c, u, getPropertyDescriptor(), true));

        // We want to ensure the attribute is returned even if null
        json.put(ATTRIBUTE_DATA_VALUE, getValue() == null ? JSONObject.NULL : getValue());

        if (_exception != null)
        {
            JSONObject jsonException = new JSONObject();
            jsonException.put(Event.SND_EXCEPTION_MSG_JSON, _exception.getMessage());
            jsonException.put(Event.SND_EXCEPTION_SEVERITY_JSON, _exception.getSeverity());
            json.put(Event.SND_EXCEPTION_JSON, jsonException);
        }

        return json;
    }
}
