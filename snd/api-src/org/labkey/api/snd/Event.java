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
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.util.DateUtil;

import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

import static org.labkey.api.snd.EventNarrativeOption.HTML_NARRATIVE;
import static org.labkey.api.snd.EventNarrativeOption.REDACTED_HTML_NARRATIVE;
import static org.labkey.api.snd.EventNarrativeOption.REDACTED_TEXT_NARRATIVE;
import static org.labkey.api.snd.EventNarrativeOption.TEXT_NARRATIVE;

/**
 * Class for event data and related methods. Used when saving, updating, deleting and getting an event
 */
public class Event
{
    private Integer _eventId;
    private String _subjectId;
    private Date _date;
    private String _projectIdRev;
    private String _note;
    private Integer _noteId;
    private List<EventData> _eventData;
    private String _parentObjectId;
    private Map<EventNarrativeOption, String> narratives;
    private Map<GWTPropertyDescriptor, Object> _extraFields = new HashMap<>();
    private Integer _qcState;
    private String _objectId;

    // This will store a count of the different severity of exceptions
    private Map<ValidationException.SEVERITY, Integer> _exceptionCount = new HashMap<>();
    private ValidationException _eventException = null;

    public static final String EVENT_ID = "eventId";
    public static final String EVENT_SUBJECT_ID = "subjectId";
    public static final String EVENT_DATE = "date";
    public static final String EVENT_PROJECT_ID_REV = "projectIdRev";
    public static final String EVENT_NOTE = "note";
    public static final String EVENT_QCSTATE = "qcState";
    public static final String EVENT_DATA = "eventData";
    public static final String EVENT_PARENT_OBJECTID = "parentObjectId";
    public static final String EVENT_CONTAINER = "Container";
    public static final String EVENT_OBJECTID = "ObjectId";

    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";  // ISO8601 w/24-hour time and 'T' character

    public static final String SND_EVENT_NAMESPACE = "SND.EventData";

    public static final String SND_EVENT_DATE_CSS_CLASS = "snd-event-date";
    public static final String SND_EVENT_SUBJECT_CSS_CLASS = "snd-event-subject";
    public static final String SND_EVENT_NOTE_CSS_CLASS = "snd-event-note";

    public static final String SND_EXCEPTION_MSG_JSON = "message";
    public static final String SND_EXCEPTION_SEVERITY_JSON = "severity";
    public static final String SND_EXCEPTION_JSON = "exception";

    public Event(@Nullable Integer eventId, String subjectId, @Nullable Date date, @NotNull String projectIdRev, @Nullable String note, @Nullable List<EventData> eventData, @NotNull Container c, @Nullable String objectId)
    {
        _eventId = eventId != null ? eventId : SNDSequencer.EVENTID.ensureId(c, null);
        _subjectId = subjectId;
        _date = date;
        _projectIdRev = projectIdRev;
        _note = note;
        _eventData = eventData;
        _noteId = SNDSequencer.EVENTID.ensureId(c, null);
        _objectId = objectId;
    }

    public Event () {}

    @Nullable
    public Integer getEventId()
    {
        return _eventId;
    }

    public void setEventId(Integer eventId)
    {
        _eventId = eventId;
    }

    public String getSubjectId()
    {
        return _subjectId;
    }

    public void setSubjectId(String subjectId)
    {
        _subjectId = subjectId;
    }

    @Nullable
    public Date getDate()
    {
        return _date;
    }

    public void setDate(Date date)
    {
        _date = date;
    }

    @Nullable
    public String getProjectIdRev()
    {
        return _projectIdRev;
    }

    public void setProjectIdRev(String projectIdRev)
    {
        _projectIdRev = projectIdRev;
    }

    @Nullable
    public String getParentObjectId()
    {
        return _parentObjectId;
    }

    public void setParentObjectId(String parentObjectId)
    {
        _parentObjectId = parentObjectId;
    }

    @Nullable
    public String getNote()
    {
        return _note;
    }

    public void setNote(String note)
    {
        _note = note;
    }

    @Nullable
    public Integer getNoteId()
    {
        return _noteId;
    }

    public void setNoteId(Integer noteId)
    {
        _noteId = noteId;
    }

    @Nullable
    public List<EventData> getEventData()
    {
        return _eventData;
    }

    public void setEventData(List<EventData> eventData)
    {
        _eventData = eventData;
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

    public Map<EventNarrativeOption, String> getNarratives()
    {
        return narratives;
    }

    public void setNarratives(Map<EventNarrativeOption, String> narratives)
    {
        this.narratives = narratives;
    }

    public Integer getQcState()
    {
        return _qcState;
    }

    @Nullable
    public QCStateEnum getQcState(Container c, User u)
    {
        if (_qcState == null)
        {
            return null;
        }

        return SNDService.get().getQCState(c, u, _qcState);
    }

    public void setQcState(Integer qcState)
    {
        _qcState = qcState;
    }

    public void setQcState(Container c, User u, QCStateEnum qcState)
    {
        _qcState = SNDService.get().getQCStateId(c, u, qcState);
    }

    public String getObjectId()
    {
        return _objectId;
    }

    public void setObjectId(String objectId)
    {
        _objectId = objectId;
    }

    public ValidationException getException()
    {
        return _eventException;
    }

    public void setException(ValidationException eventException)
    {
        _eventException = eventException;
    }

    public Map<ValidationException.SEVERITY, Integer> getExceptionCountMap()
    {
        return _exceptionCount;
    }

    public void updateExceptionCount(ValidationException e)
    {
        Integer count = _exceptionCount.get(e.getSeverity());
        if (count != null)
        {
            count++;
        }
        else
        {
            count = 1;
        }

        _exceptionCount.put(e.getSeverity(), count);
    }

    public Integer getErrorCount()
    {
        Integer count = _exceptionCount.get(ValidationException.SEVERITY.ERROR);
        return count == null ? 0 : count;
    }

    public void addBatchValidationExceptions(BatchValidationException bve)
    {
        int count;
        for (ValidationException ve : bve.getRowErrors())
        {
            count = 0;
            if (_exceptionCount.get(ve.getSeverity()) != null)
            {
                count = _exceptionCount.get(ve.getSeverity()) + 1;
            }
            _exceptionCount.put(ve.getSeverity(), count);
            if (ve.getSeverity() == ValidationException.SEVERITY.ERROR)
                _eventException = ve;
        }
    }

    public boolean hasErrors()
    {
        Integer count = _exceptionCount.get(ValidationException.SEVERITY.ERROR);
        if (count != null && count > 0)
            return true;

        return (_eventException != null && _eventException.getSeverity() == ValidationException.SEVERITY.ERROR);
    }

    public boolean hasErrorsWarningsOrInfo()
    {
        Integer errorCount = _exceptionCount.get(ValidationException.SEVERITY.ERROR);
        Integer warningCount = _exceptionCount.get(ValidationException.SEVERITY.WARN);
        Integer infoCount = _exceptionCount.get(ValidationException.SEVERITY.INFO);
        if ((errorCount != null && errorCount > 0) || (warningCount != null && warningCount > 0) || (infoCount != null && infoCount > 0))
            return true;

        return (_eventException != null);
    }

    @NotNull
    public Map<String, Object> getEventRow(Container c)
    {
        Map<String, Object> eventValues = new ArrayListMap<>();
        if (getEventId() != null)
            eventValues.put(EVENT_ID, getEventId());

        eventValues.put(EVENT_SUBJECT_ID, getSubjectId());
        eventValues.put(EVENT_DATE, getDate());
        eventValues.put(EVENT_PARENT_OBJECTID, getParentObjectId());
        eventValues.put(EVENT_QCSTATE, getQcState());
        eventValues.put(EVENT_CONTAINER, c.getId());
        eventValues.put(EVENT_OBJECTID, getObjectId());

        Map<GWTPropertyDescriptor, Object> extras = getExtraFields();
        for (GWTPropertyDescriptor gpd : extras.keySet())
        {
            eventValues.put(gpd.getName(), extras.get(gpd));
        }

        return eventValues;
    }

    @NotNull
    public Map<String, Object> getEventNotesRow(Container c)
    {
        Map<String, Object> eventValues = new ArrayListMap<>();
        if (getEventId() != null)
            eventValues.put(EVENT_ID, getEventId());

        eventValues.put(EVENT_NOTE, getNote());
        eventValues.put(EVENT_CONTAINER, c.getId());

        return eventValues;
    }

    @NotNull
    public JSONObject toJSON(Container c, User u)
    {
        JSONObject json = new JSONObject();
        json.put(EVENT_ID, getEventId());
        json.put(EVENT_SUBJECT_ID, getSubjectId());

        if (getDate() != null)
            json.put(EVENT_DATE, DateUtil.formatDateTime(getDate(), DATE_TIME_FORMAT));

        json.put(EVENT_PROJECT_ID_REV, getProjectIdRev());
        json.put(EVENT_NOTE, getNote());

        if (_qcState != null)
        {
            json.put(EVENT_QCSTATE, getQcState(c, u).getName());
        }
        if (_objectId != null)
        {
            json.put(EVENT_OBJECTID, getObjectId());
        }

        JSONArray eventDataJson = new JSONArray();
        if (getEventData() != null)
        {
            for (EventData eventData : getEventData())
            {
                eventDataJson.put(eventData.toJSON(c, u));
            }
        }
        json.put(EVENT_DATA, eventDataJson);

        JSONArray extras = new JSONArray();
        Map<GWTPropertyDescriptor, Object> extraFields = getExtraFields();
        if (extraFields != null)
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

        if (_eventException != null)
        {
            JSONObject jsonException = new JSONObject();
            jsonException.put(Event.SND_EXCEPTION_MSG_JSON, _eventException.getMessage());
            jsonException.put(Event.SND_EXCEPTION_SEVERITY_JSON, _eventException.getSeverity());
            json.put(Event.SND_EXCEPTION_JSON, jsonException);
        }
        else
        {
            StringBuilder msg = new StringBuilder();
            Integer count = _exceptionCount.get(ValidationException.SEVERITY.ERROR);
            ValidationException.SEVERITY severity = null;
            if (count != null && count > 0)
            {
                severity = ValidationException.SEVERITY.ERROR;
                msg.append(count + " error");
                if (count > 1)
                    msg.append("s");
            }

            count = _exceptionCount.get(ValidationException.SEVERITY.WARN);
            if (count != null && count > 0)
            {
                if (severity == null)
                    severity = ValidationException.SEVERITY.WARN;

                if (msg.length() > 0)
                    msg.append(", ");

                msg.append(count + " warning");
                if (count > 1)
                    msg.append("s");
            }

            count = _exceptionCount.get(ValidationException.SEVERITY.INFO);
            if (count != null && count > 0)
            {
                if (severity == null)
                    severity = ValidationException.SEVERITY.INFO;

                if (msg.length() > 0)
                    msg.append(", ");

                msg.append(count + " info");
                if (count > 1)
                    msg.append("s");
            }

            if (msg.length() > 0)
            {
                msg.append(" found");

                JSONObject jsonException = new JSONObject();
                jsonException.put(Event.SND_EXCEPTION_MSG_JSON, msg.toString());
                jsonException.put(Event.SND_EXCEPTION_SEVERITY_JSON, severity);
                json.put(Event.SND_EXCEPTION_JSON, jsonException);
            }
        }
        Map<EventNarrativeOption, String> narratives = getNarratives();
        if (narratives != null)
        {
            for (EventNarrativeOption narrativeOption : narratives.keySet())
            {
                String narrative = narratives.get(narrativeOption);
                switch (narrativeOption)
                {
                    case TEXT_NARRATIVE:
                        json.put(TEXT_NARRATIVE.getKey(), narrative);
                        break;
                    case REDACTED_TEXT_NARRATIVE:
                        json.put(REDACTED_TEXT_NARRATIVE.getKey(), narrative);
                        break;
                    case HTML_NARRATIVE:
                        json.put(HTML_NARRATIVE.getKey(), narrative);
                        break;
                    case REDACTED_HTML_NARRATIVE:
                        json.put(REDACTED_HTML_NARRATIVE.getKey(), narrative);
                        break;
                }
            }
        }

        return json;
    }
}
