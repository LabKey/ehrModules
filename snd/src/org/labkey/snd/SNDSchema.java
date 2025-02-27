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

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;

public class SNDSchema
{
    private static final SNDSchema _instance = new SNDSchema();
    public static final String NAME = "snd";
    public static final String PKGS_TABLE_NAME = "Pkgs";
    public static final String PKGCATEGORYJUNCTION_TABLE_NAME = "PkgCategoryJunction";
    public static final String PKGCATEGORIES__TABLE_NAME = "PkgCategories";
    public static final String SUPERPKGS_TABLE_NAME = "SuperPkgs";
    public static final String EVENTS_TABLE_NAME = "Events";
    public static final String EVENTDATA_TABLE_NAME = "EventData";
    public static final String EVENTNOTES_TABLE_NAME = "EventNotes";
    public static final String PROJECTS_TABLE_NAME = "Projects";
    public static final String PROJECTITEMS_TABLE_NAME = "ProjectItems";
    public static final String LOOKUPS_TABLE_NAME = "Lookups";
    public static final String LOOKUPSETS_TABLE_NAME = "LookupSets";
    public static final String SUPERPKGS_FUNCTION_NAME = "fGetSuperPkg";
    public static final String ALL_SUPERPKGS_FUNCTION_NAME = "fGetAllSuperPkgs";
    public static final String PROJECTS_FUNCTION_NAME = "fGetProjectItems";
    public static final String EVENTSCACHE_TABLE_NAME = "EventsCache";

    public static SNDSchema getInstance()
    {
        return _instance;
    }

    private SNDSchema()
    {
        // private constructor to prevent instantiation from
        // outside this class: this singleton should only be
        // accessed via org.labkey.snd.SNDSchema.getInstance()
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(NAME, DbSchemaType.Module);
    }

    public SqlDialect getSqlDialect()
    {
        return getSchema().getSqlDialect();
    }

    public TableInfo getTableInfoPkgs()
    {
        return getSchema().getTable(PKGS_TABLE_NAME);
    }

    public TableInfo getTableInfoPkgCategoryJunction()
    {
        return getSchema().getTable(PKGCATEGORYJUNCTION_TABLE_NAME);
    }

    public TableInfo getTableInfoPkgCategories()
    {
        return getSchema().getTable(PKGCATEGORIES__TABLE_NAME);
    }

    public TableInfo getTableInfoSuperPkgs()
    {
        return getSchema().getTable(SUPERPKGS_TABLE_NAME);
    }

    public TableInfo getTableInfoEvents()
    {
        return getSchema().getTable(EVENTS_TABLE_NAME);
    }

    public TableInfo getTableInfoEventData()
    {
        return getSchema().getTable(EVENTDATA_TABLE_NAME);
    }

    public TableInfo getTableInfoEventNotes()
    {
        return getSchema().getTable(EVENTNOTES_TABLE_NAME);
    }

    public TableInfo getTableInfoProjects()
    {
        return getSchema().getTable(PROJECTS_TABLE_NAME);
    }

    public TableInfo getTableInfoProjectItems()
    {
        return getSchema().getTable(PROJECTITEMS_TABLE_NAME);
    }

    public TableInfo getTableInfoLookups()
    {
        return getSchema().getTable(LOOKUPS_TABLE_NAME);
    }

    public TableInfo getTableInfoLookupSets() { return getSchema().getTable(LOOKUPSETS_TABLE_NAME); }

    public TableInfo getTableInfoEventsCache()
    {
        return getSchema().getTable(EVENTSCACHE_TABLE_NAME);
    }
}
