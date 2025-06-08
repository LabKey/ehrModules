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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.snd.SNDUserSchema;
import org.labkey.api.snd.PlainTextNarrativeDisplayColumn;
import org.labkey.snd.security.permissions.SNDViewerPermission;

import java.util.ArrayList;
import java.util.List;

public class EventsCacheTable extends AbstractSNDTableInfo
{
    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     */
    public EventsCacheTable(SNDUserSchema schema, TableInfo table)
    {
        super(schema, table);
    }

    static final List<FieldKey> defaultVisibleColumns = new ArrayList<>();

    static
    {
        defaultVisibleColumns.add(FieldKey.fromParts("EventId"));
        defaultVisibleColumns.add(FieldKey.fromParts("HtmlNarrative"));
        defaultVisibleColumns.add(FieldKey.fromParts("Plain Text Narrative"));
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
       return getContainer().hasPermission(user, SNDViewerPermission.class, getUserSchema().getContextualRoles());
    }

    @Override
    public List<FieldKey> getDefaultVisibleColumns()
    {
        return defaultVisibleColumns;
    }

    @Override
    public EventsCacheTable init()
    {
        super.init();

        var plainTextNarrativeColumn = addColumn(wrapColumn("Plain Text Narrative", getRealTable().getColumn("HtmlNarrative")));
        plainTextNarrativeColumn.setDisplayColumnFactory(PlainTextNarrativeDisplayColumn::new);

        return this;
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return null;
    }
}
