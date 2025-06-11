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
package org.labkey.snd.query;

import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleUserSchema.SimpleTable;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.snd.Event;
import org.labkey.api.snd.SNDService;
import org.labkey.snd.NarrativeAuditProvider;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;
import org.labkey.snd.security.QCStateActionEnum;
import org.labkey.snd.security.SNDSecurityManager;
import org.labkey.snd.security.permissions.SNDViewerPermission;

import java.io.IOException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class EventsTable extends AbstractSNDTableInfo
{
    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     */
    private final SNDManager _sndManager = SNDManager.get();

    public EventsTable(SNDUserSchema schema, TableInfo table)
    {
        super(schema, table);
    }

    @Override
    public boolean supportsContainerFilter()
    {
        return super.supportsContainerFilter();
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new EventsTable.UpdateService(this);
    }

    protected class UpdateService extends SNDQueryUpdateService
    {
        public UpdateService(SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        private final SNDService _sndService = SNDService.get();

        private Set<Integer> handleNarrativeCache(DataIteratorBuilder rows, @Nullable Map<Enum,Object> configParameters, BatchValidationException errors)
        {
            List<Map<String, Object>> data;
            Set<Integer> eventIds = new HashSet<>();
            DataIteratorContext dataIteratorContext = getDataIteratorContext(errors, InsertOption.MERGE, configParameters);

            try
            {
                data = _sndService.getMutableData(rows, dataIteratorContext);
            }
            catch (IOException e)
            {
                errors.addRowError(new ValidationException(e.getMessage()));
                return eventIds;
            }

            for(Map<String, Object> map : data)
            {
                eventIds.add((Integer) map.get("EventId"));
            }

            return eventIds;
        }

        @Override
        public int truncateRows(User user, Container container, @Nullable Map<Enum, Object> configParameters, @Nullable Map<String, Object> extraScriptContext)
                throws BatchValidationException, QueryUpdateServiceException, SQLException
        {
            _sndService.clearNarrativeCache(container, user);
            return super.truncateRows(user, container, configParameters, extraScriptContext);
        }

        @Override
        public int importRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                              @Nullable Map<Enum,Object> configParameters, Map<String, Object> extraScriptContext)
        {
            Logger log = SNDManager.getLogger(configParameters, EventsTable.class);

            int result = super.importRows(user, container, rows, errors, configParameters, extraScriptContext);

            // update rows in narrative cache
            Set<Integer> eventIds = handleNarrativeCache(rows, configParameters, errors);
            _sndManager.updateNarrativeCache(container, user, eventIds, log);

            return result;
        }

        @Override
        public int mergeRows(User user, Container container, DataIteratorBuilder rows, BatchValidationException errors,
                             @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext)
        {
            Logger log = SNDManager.getLogger(configParameters, EventsTable.class);

            Set<Integer> eventIds = handleNarrativeCache(rows, configParameters, errors);

            int result;
            int maxMergeRows = SNDManager.MAX_MERGE_ROWS * 10;

            // Large merge triggers importRows path
            if (eventIds.size() > maxMergeRows)
            {
                log.info("More than " + maxMergeRows + " rows. using importRows method.");
                result = super.importRows(user, container, rows, errors, configParameters, extraScriptContext);
            }
            else
            {
                log.info("Merging rows.");
                result = super.mergeRows(user, container, rows, errors, configParameters, extraScriptContext);
            }
            // update rows in narrative cache
            _sndManager.updateNarrativeCache(container, user, eventIds, log);

            return result;
        }

        @Override
        protected Map<String, Object> deleteRow(User user, Container container, Map<String, Object> oldRowMap) throws QueryUpdateServiceException, SQLException, InvalidKeyException
        {
            int eventId = (Integer) oldRowMap.get("EventId");
            String subjectId = (String) oldRowMap.get("SubjectId");
            Date eventDate = (Date) oldRowMap.get("Date");
            Integer qcState = (Integer) oldRowMap.get("QcState");

            BatchValidationException errors = new BatchValidationException();
            Event event = SNDManager.get().getEvent(container, user, eventId, null, null, true, errors);
            if (event == null || event.getEventId() == null)
            {
                throw new QueryUpdateServiceException("Event not found.");
            }

            if (!SNDSecurityManager.get().hasPermissionForTopLevelSuperPkgs(container, user, SNDManager.get().getTopLevelEventDataSuperPkgs(container, user, event), event, QCStateActionEnum.DELETE))
            {
                if (event.hasErrors())
                {
                    throw new QueryUpdateServiceException(event.getException());
                }
                else
                {
                    throw new QueryUpdateServiceException("You do not have permission to delete this event.");
                }
            }

            // This needs to be an atomic operation otherwise could get deadlock
            try (DbScope.Transaction tx = SNDSchema.getInstance().getSchema().getScope().ensureTransaction(SNDService.get().getWriteLock()))
            {
                SNDManager.get().deleteEventsCache(container, user, eventId);
                SNDManager.get().deleteEventDatas(container, user, eventId);
                SNDManager.get().deleteEventNotes(container, user, eventId);
                tx.commit();
            }
            catch (BatchValidationException e)
            {
                throw new QueryUpdateServiceException(e.getMessage());
            }

            NarrativeAuditProvider.addAuditEntry(container, user, eventId, subjectId, eventDate, null, qcState, "Delete event");

            List<Map<String, Object>> cacheData = new ArrayList<>();
            Map<String, Object> cacheKey = new HashMap<>();
            cacheKey.put("EventId", oldRowMap.get("EventId"));
            cacheData.add(cacheKey);

            // now delete package row
            Map<String, Object> result = super.deleteRow(user, container, oldRowMap);

            // delete row from narrative cache
            _sndService.deleteNarrativeCacheRows(container, user, cacheData);

            return result;
        }
    }
    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        return getContainer().hasPermission(user, SNDViewerPermission.class, getUserSchema().getContextualRoles());
    }
}
