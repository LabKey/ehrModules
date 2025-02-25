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
package org.labkey.snd;

import org.labkey.api.audit.AbstractAuditTypeProvider;
import org.labkey.api.audit.AuditLogService;
import org.labkey.api.audit.AuditTypeEvent;
import org.labkey.api.audit.AuditTypeProvider;
import org.labkey.api.audit.query.AbstractAuditDomainKind;
import org.labkey.api.data.Container;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.PropertyType;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class NarrativeAuditProvider extends AbstractAuditTypeProvider implements AuditTypeProvider
{
    public static final String NARRATIVE_AUDIT_EVENT = "NarrativeAuditEvent";
    public static final String COLUMN_NAME_NARRATIVE = "Narrative";
    public static final String COLUMN_NAME_EVENTID = "EventId";
    public static final String COLUMN_NAME_SUBJECTID = "SubjectId";
    public static final String COLUMN_NAME_EVENTDATE = "EventDate";
    public static final String COLUMN_NAME_QCSTATE = "QcState";

    static final List<FieldKey> defaultVisibleColumns = new ArrayList<>();

    static {

        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_CREATED));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_CREATED_BY));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_IMPERSONATED_BY));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_COMMENT));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_NARRATIVE));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_EVENTID));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_SUBJECTID));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_EVENTDATE));
        defaultVisibleColumns.add(FieldKey.fromParts(COLUMN_NAME_QCSTATE));
    }

    @Override
    protected AbstractAuditDomainKind getDomainKind()
    {
        return new org.labkey.snd.NarrativeAuditProvider.NarrativeAuditDomainKind();
    }

    @Override
    public String getEventName()
    {
        return NARRATIVE_AUDIT_EVENT;
    }

    @Override
    public String getLabel()
    {
        return "SND Narrative Events";
    }

    @Override
    public String getDescription()
    {
        return "Information about SND events that update narratives.";
    }

    @Override
    public List<FieldKey> getDefaultVisibleColumns()
    {
        return defaultVisibleColumns;
    }

    @Override
    public <K extends AuditTypeEvent> Class<K> getEventClass()
    {
        return (Class<K>)NarrativeAuditTypeEvent.class;
    }

    public static void addAuditEntry(Container container, User user, Integer eventId, String subjectId, Date eventDate, String narrative, Integer qcState, String comment)
    {
        NarrativeAuditProvider.NarrativeAuditTypeEvent event = new NarrativeAuditProvider.NarrativeAuditTypeEvent(container.getId(), comment);
        event.setNarrative(narrative);
        event.setEventId(eventId);
        event.setSubjectId(subjectId);
        event.setEventDate(eventDate);
        event.setQcState(qcState);

        AuditLogService.get().addEvent(user, event);
    }

    public static class NarrativeAuditTypeEvent extends AuditTypeEvent
    {
        private String _narrative;
        private Integer _eventId;
        private String _subjectId;
        private Date _eventDate;
        private Integer _qcState;

        public NarrativeAuditTypeEvent()
        {
            super();
        }

        public NarrativeAuditTypeEvent(String container, String comment)
        {
            super(NARRATIVE_AUDIT_EVENT, container, comment);
        }

        public String getNarrative()
        {
            return _narrative;
        }

        public void setNarrative(String narrative)
        {
            _narrative = narrative;
        }

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

        public Date getEventDate()
        {
            return _eventDate;
        }

        public void setEventDate(Date eventDate)
        {
            _eventDate = eventDate;
        }

        public Integer getQcState()
        {
            return _qcState;
        }

        public void setQcState(Integer qcState)
        {
            _qcState = qcState;
        }
    }

    public static class NarrativeAuditDomainKind extends AbstractAuditDomainKind
    {
        public static final String NAME = "SNDNarrativeAuditDomain";
        public static String NAMESPACE_PREFIX = "Audit-" + NAME;

        private final Set<PropertyDescriptor> _fields;

        public NarrativeAuditDomainKind()
        {
            super(NARRATIVE_AUDIT_EVENT);

            Set<PropertyDescriptor> fields = new LinkedHashSet<>();
            fields.add(createPropertyDescriptor(COLUMN_NAME_NARRATIVE, PropertyType.STRING));
            fields.add(createPropertyDescriptor(COLUMN_NAME_EVENTID, PropertyType.INTEGER));
            fields.add(createPropertyDescriptor(COLUMN_NAME_SUBJECTID, PropertyType.STRING));
            fields.add(createPropertyDescriptor(COLUMN_NAME_EVENTDATE, PropertyType.DATE_TIME));
            PropertyDescriptor pd = createPropertyDescriptor(COLUMN_NAME_QCSTATE, PropertyType.INTEGER);
            pd.setLookupSchema("core");
            pd.setLookupQuery("QCState");
            fields.add(pd);

            _fields = Collections.unmodifiableSet(fields);
        }

        @Override
        public Set<PropertyDescriptor> getProperties()
        {
            return _fields;
        }

        @Override
        protected String getNamespacePrefix()
        {
            return NAMESPACE_PREFIX;
        }

        @Override
        public String getKindName()
        {
            return NAME;
        }
    }
}
