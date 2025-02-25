/*
 * Copyright (c) 2017-2018 LabKey Corporation
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

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager.ContainerListener;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.security.User;

import java.beans.PropertyChangeEvent;
import java.util.Collection;
import java.util.Collections;

public class SNDContainerListener implements ContainerListener
{
    @Override
    public void containerCreated(Container c, User user)
    {
    }

    @Override
    public void containerDeleted(Container c, User user)
    {
        // This will clean up the SND schema.  We will rely on the exp module to clean up related exp data.
        DbScope scope = SNDSchema.getInstance().getSchema().getScope();
        SimpleFilter containerFilter = SimpleFilter.createContainerFilter(c);
        try (DbScope.Transaction transaction = scope.ensureTransaction())
        {
            Table.delete(SNDSchema.getInstance().getTableInfoPkgCategoryJunction(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoPkgCategories(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoEventData(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoEventNotes(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoEventsCache(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoEvents(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoProjectItems(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoProjects(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoSuperPkgs(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoPkgs(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoLookups(), containerFilter);
            Table.delete(SNDSchema.getInstance().getTableInfoLookupSets(), containerFilter);

            transaction.commit();
        }
    }

    @Override
    public void propertyChange(PropertyChangeEvent evt)
    {
    }

    @Override
    public void containerMoved(Container c, Container oldParent, User user)
    {
    }

    @NotNull @Override
    public Collection<String> canMove(Container c, Container newParent, User user)
    {
        return Collections.emptyList();
    }
}