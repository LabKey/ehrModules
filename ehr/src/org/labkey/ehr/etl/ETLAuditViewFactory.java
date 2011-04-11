package org.labkey.ehr.etl;

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

import org.labkey.api.audit.AuditLogEvent;
import org.labkey.api.audit.AuditLogService;
import org.labkey.api.audit.SimpleAuditViewFactory;
import org.labkey.api.audit.query.AuditLogQueryView;
import org.labkey.api.data.Container;
import org.labkey.api.data.DataRegion;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.QueryView;
import org.labkey.api.security.User;
import org.labkey.api.view.ViewContext;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Event field documentation:
 *
 * created - Timestamp
 * createdBy - User who created the record
 * impersonatedBy - user who was impersonating the user (or null)
 * comment - record description
 * intKey1 - the user id of the principal being modified
 *
 * User: jeckels
 * Date: Jul 30, 2010
 */
public class ETLAuditViewFactory extends SimpleAuditViewFactory
{
    public static final String AUDIT_EVENT_TYPE = "EHRSyncAuditEvent";

    private static final ETLAuditViewFactory _instance = new ETLAuditViewFactory();

    public static ETLAuditViewFactory getInstance()
    {
        return _instance;
    }

    private ETLAuditViewFactory(){}

    public String getEventType()
    {
        return AUDIT_EVENT_TYPE;
    }

    public String getName()
    {
        return "EHR ETL Events";
    }

    public QueryView createDefaultQueryView(ViewContext context)
    {
        SimpleFilter filter = new SimpleFilter("EventType", getEventType());

        AuditLogQueryView view = AuditLogService.get().createQueryView(context, filter, getEventType());
        view.setSort(new Sort("-Date"));
        view.setButtonBarPosition(DataRegion.ButtonBarPosition.BOTH);

        return view;
    }

    public List<FieldKey> getDefaultVisibleColumns()
    {
        List<FieldKey> columns = new ArrayList<FieldKey>();

        columns.add(FieldKey.fromParts("Date"));
        columns.add(FieldKey.fromParts("CreatedBy"));
        columns.add(FieldKey.fromParts("ImpersonatedBy"));
        columns.add(FieldKey.fromParts("Key1"));
        columns.add(FieldKey.fromParts("IntKey1"));
        columns.add(FieldKey.fromParts("IntKey2"));
        columns.add(FieldKey.fromParts("Comment"));

        return columns;
    }

    public void setupTable(FilteredTable table)
    {
        table.getColumn("Key1").setLabel("Type");
        table.getColumn("IntKey1").setLabel("ListErrors");
        table.getColumn("IntKey2").setLabel("DatasetErrors");
    }

    public static void addAuditEntry(Container container, User user, String type, String comment, int listErrors, int datasetErrors)
    {
        AuditLogEvent event = new AuditLogEvent();
        event.setContainerId(container.getId());
        event.setEventType(AUDIT_EVENT_TYPE);
        event.setCreatedBy(user);
        event.setComment(comment);
        event.setKey1(type);
        event.setIntKey1(listErrors);
        event.setIntKey2(datasetErrors);
        event.setCreated(new Date());
        AuditLogService.get().addEvent(event);
    }
}
