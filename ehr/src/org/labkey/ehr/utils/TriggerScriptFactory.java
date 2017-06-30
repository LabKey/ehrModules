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
package org.labkey.ehr.utils;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.triggers.ScriptTriggerFactory;
import org.labkey.api.data.triggers.Trigger;
import org.labkey.api.query.QueryService;
import org.labkey.api.script.ScriptService;
import org.labkey.api.util.FileUtil;
import org.labkey.api.util.Path;

import javax.script.ScriptException;
import java.util.Collection;
import java.util.Collections;

/**
 * Created by Marty on 4/24/2017.
 */
public class TriggerScriptFactory extends ScriptTriggerFactory
{
    @Override
    @NotNull
    protected Collection<Trigger> createTriggerScript(Container c, TableInfo table) throws ScriptException
    {
        // Check if other triggers exist
        Collection<Trigger> ret = super.createTriggerScript(c, table);
        if (!ret.isEmpty())
        {
            return Collections.EMPTY_LIST;  // Other triggers have already been added so no op.
        }

        // Only if the table lacks other triggers look for DefaultTriggerScript.js
        Path path = new Path(QueryService.MODULE_QUERIES_DIRECTORY,
                FileUtil.makeLegalName(table.getSchema().getName()),
                FileUtil.makeLegalName("DefaultTriggerScript.js"));

        ScriptService svc = ScriptService.get();
        if (svc == null)
            return Collections.emptyList();

        return super.checkPaths(c, table, svc, Collections.singleton(path));
    }
}
