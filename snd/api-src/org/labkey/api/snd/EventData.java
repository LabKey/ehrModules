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
import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.collections.ArrayListMap;
import org.labkey.api.data.Container;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * Class for event data and related methods. Used in Event class
 */
public class EventData
{
    private Integer _eventDataId;
    private int _superPkgId;
    private int _eventId;
    private Integer _parentEventDataId;
    private Integer _sortOrder;
    private String _narrativeTemplate;
    private String _objectURI;
    private List<EventData> _subPackages;
    private List<AttributeData> _attributes = new ArrayList<>();
    private Map<GWTPropertyDescriptor, Object> _extraFields = new HashMap<>();
    private ValidationException _exception;

    public static final String EVENT_DATA_ID = "eventDataId";
    public static final String EVENT_DATA_SUPER_PACKAGE_ID = "superPkgId";
    public static final String EVENT_DATA_NARRATIVE_TEMPLATE = "narrativeTemplate";
    public static final String EVENT_DATA_SUB_PACKAGES = "subPackages";
    public static final String EVENT_DATA_ATTRIBUTES = "attributes";
    public static final String EVENT_DATA_OBJECTURI = "objectURI";
    public static final String EVENT_DATA_EVENTID = "eventId";
    public static final String EVENT_DATA_PARENT_EVENTDATAID = "parentEventDataId";
    public static final String EVENT_DATA_SORT_ORDER = "sortOrder";
    public static final String EVENT_DATA_CONTAINER = "Container";
    public static final String EVENT_DATA_CSS_CLASS = "snd-event-data";
    public static final String EVENT_DATA_EXTRA_FIELDS = "extraFields";

    public EventData(@Nullable Integer eventDataId, int superPkgId, @Nullable String narrative, @Nullable List<EventData> subPackages, @NotNull List<AttributeData> attributes)
    {
          this(eventDataId, superPkgId, narrative, subPackages, attributes, null);
    }
    public EventData(@Nullable Integer eventDataId, int superPkgId, @Nullable String narrative, @Nullable List<EventData> subPackages, @NotNull List<AttributeData> attributes , @Nullable Integer sortOrder)
    {
        _eventDataId = eventDataId;
        _superPkgId = superPkgId;
        _narrativeTemplate = narrative;
        _subPackages = subPackages;
        _sortOrder = sortOrder;

        if (attributes != null)
            _attributes = attributes;
    }
    public EventData() {}

    @Nullable
    public Integer getEventDataId()
    {
        return _eventDataId;
    }

    public void setEventDataId(Integer eventDataId)
    {
        _eventDataId = eventDataId;
    }

    public int getSuperPkgId()
    {
        return _superPkgId;
    }

    public void setSuperPkgId(int superPkgId)
    {
        _superPkgId = superPkgId;
    }

    @Nullable
    public Integer getParentEventDataId()
    {
        return _parentEventDataId;
    }

    public void setParentEventDataId(Integer parentEventDataId)
    {
        _parentEventDataId = parentEventDataId;
    }

    @Nullable
    public String getNarrativeTemplate()
    {
        return _narrativeTemplate;
    }

    public void setNarrativeTemplate(String narrative)
    {
        _narrativeTemplate = narrative;
    }

    @Nullable
    public String getObjectURI()
    {
        return _objectURI;
    }

    public void setObjectURI(String objectURI)
    {
        _objectURI = objectURI;
    }

    public int getEventId()
    {
        return _eventId;
    }

    public void setEventId(int eventId)
    {
        _eventId = eventId;
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

    public Integer getSortOrder()
    {
        return _sortOrder;
    }

    public void setSortOrder(Integer sortOrder)
    {
        _sortOrder = sortOrder;
    }

    @Nullable
    public List<EventData> getSubPackages()
    {
        return _subPackages;
    }

    public void setSubPackages(List<EventData> subPackages)
    {
        _subPackages = subPackages;
    }

    @NotNull
    public List<AttributeData> getAttributes()
    {
        return _attributes;
    }

    public void setAttributes(@NotNull List<AttributeData> attributes)
    {
        _attributes = attributes;
    }

    @NotNull
    public Map<GWTPropertyDescriptor, Object> getExtraFields()
    {
        return _extraFields;
    }

    public void setExtraFields(@NotNull Map<GWTPropertyDescriptor, Object> extraFields)
    {
        _extraFields = extraFields;
    }

    @NotNull
    public Map<String, Object> getEventDataRow(Container c)
    {
        Map<String, Object> eventDataValues = new ArrayListMap<>();
        eventDataValues.put(EVENT_DATA_ID, getEventDataId());
        eventDataValues.put(EVENT_DATA_SUPER_PACKAGE_ID, getSuperPkgId());
        eventDataValues.put(EVENT_DATA_OBJECTURI, getObjectURI());
        eventDataValues.put(EVENT_DATA_EVENTID, getEventId());
        eventDataValues.put(EVENT_DATA_PARENT_EVENTDATAID, getParentEventDataId());
        eventDataValues.put(EVENT_DATA_CONTAINER, c);
        eventDataValues.put(EVENT_DATA_SORT_ORDER, getSortOrder());

        Map<GWTPropertyDescriptor, Object> extras = getExtraFields();
        for (GWTPropertyDescriptor gpd : extras.keySet())
        {
            eventDataValues.put(gpd.getName(), extras.get(gpd));
        }

        return eventDataValues;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        json.put(EVENT_DATA_ID, getEventDataId());
        json.put(EVENT_DATA_SUPER_PACKAGE_ID, getSuperPkgId());
        json.put(EVENT_DATA_NARRATIVE_TEMPLATE, getNarrativeTemplate());
        json.put(EVENT_DATA_SORT_ORDER, getSortOrder());

        JSONArray subPackagesJson = new JSONArray();
        if (getSubPackages() != null)
        {
            for (EventData eventData : getSubPackages())
            {
                subPackagesJson.put(eventData.toJSON(c, u));
            }
        }
        json.put(EVENT_DATA_SUB_PACKAGES, subPackagesJson);

        JSONArray attributesJson = new JSONArray();
        if (getAttributes() != null)
        {
            for (AttributeData attributeData : getAttributes())
            {
                attributesJson.put(attributeData.toJSON(c, u));
            }
        }
        json.put(EVENT_DATA_ATTRIBUTES, attributesJson);

        JSONArray extras = new JSONArray();
        Map<GWTPropertyDescriptor, Object> extraFields = getExtraFields();
        if(extraFields != null)
        {
            JSONObject jsonExtra;
            Set<GWTPropertyDescriptor> keys = new TreeSet<>(
                    Comparator.comparing(GWTPropertyDescriptor::getName)
            );
            keys.addAll(extraFields.keySet());
            for (GWTPropertyDescriptor extraPd : keys)
            {
                jsonExtra = SNDService.get().convertPropertyDescriptorToJson(c, u, extraPd, true);
                jsonExtra.put("value", extraFields.get(extraPd));
                extras.put(jsonExtra);
            }

            json.put("extraFields", extras);
        }

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
