/*
 * Copyright (c) 2012 LabKey Corporation
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

package org.labkey.viral_load_assay;

import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;

public class Viral_Load_AssaySchema
{
    private static final Viral_Load_AssaySchema _instance = new Viral_Load_AssaySchema();
    public static final String TABLE_ABI7500_DETECTORS = "abi7500_detectors";

    public static Viral_Load_AssaySchema getInstance()
    {
        return _instance;
    }

    private Viral_Load_AssaySchema()
    {
        // private constructor to prevent instantiation from
        // outside this class
    }

    public DbSchema getSchema()
    {
        return DbSchema.get(Viral_Load_AssayModule.SCHEMA_NAME, DbSchemaType.Module);
    }
}
