/*
 * Copyright (c) 2017 LabKey Corporation
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
package org.labkey.ehr.query;

import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleTableDomainKind;
import org.labkey.api.query.UserSchema;
import org.labkey.ehr.model.EHRDomainKind;
import org.labkey.ehr.model.EHRDomainUpdateHelper;

public class EHRContainerScopedTable<SchemaType extends UserSchema> extends ContainerScopedTable<SchemaType>
{
    public EHRContainerScopedTable(SchemaType schema, TableInfo table, String newPk)
    {
        super(schema, table, newPk);
    }

    @Override
    public SimpleTableDomainKind getDomainKind()
    {
        if (getObjectUriColumn() == null)
            return null;

        return (EHRDomainKind) PropertyService.get().getDomainKindByName(EHRDomainKind.KIND_NAME);
    }

    @Override
    protected Container getDomainContainer()
    {
        return EHRDomainKind.getDomainContainer(getContainer());
    }

    public QueryUpdateService getUpdateService()
    {
        TableInfo table = getRealTable();
        if (table != null)
            return new ContainerScopedTable.UpdateService(this, table, new EHRDomainUpdateHelper(this));

        return null;
    }
}
