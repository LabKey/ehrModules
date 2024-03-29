/*
 * Copyright (c) 2019 LabKey Corporation
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
package org.labkey.api.ehr.security;

import org.labkey.api.audit.query.AbstractAuditDomainKind;
import org.labkey.api.study.security.SecurityEscalationAuditProvider;

/**
 * @see SecurityEscalationAuditProvider
 */
public class EHRSecurityEscalatorAuditProvider extends SecurityEscalationAuditProvider
{
    public static String EVENT_TYPE = EHRSecurityEscalationEvent.class.getSimpleName();
    public static String AUDIT_LOG_TITLE = "EHR Security Escalations";

    @Override
    public String getDescription() {
        return "This audits all uses of the EHR Security Escalation";
    }

    @Override
    public Class<? extends SecurityEscalationEvent> getEventClass() {
        return EHRSecurityEscalationEvent.class;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    @Override
    public String getAuditLogTitle() {
        return AUDIT_LOG_TITLE;
    }

    @Override
    protected AbstractAuditDomainKind getDomainKind() {
        return new EHRSecurityEscalationDomain();
    }

    public static class EHRSecurityEscalationEvent extends SecurityEscalationEvent
    {
        @Override
        public String getEventType() {
            return EVENT_TYPE;
        }
    }

    public static class EHRSecurityEscalationDomain extends SecurityEscalationAuditDomainKind
    {
        public EHRSecurityEscalationDomain() {
            super(EVENT_TYPE, EHRSecurityEscalationEvent.class.getName());
        }
    }
}
