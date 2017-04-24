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
        Collection<Trigger> ret = super.createTriggerScript(c, table);
        if (!ret.isEmpty())
        {
            return ret;
        }

        // Only if the table lacks other triggers, also look for DefaultTriggerScript.js
        Path path = new Path(QueryService.MODULE_QUERIES_DIRECTORY,
                FileUtil.makeLegalName("default"),
                FileUtil.makeLegalName("DefaultTriggerScript.js"));

        ScriptService svc = ScriptService.get();
        if (svc == null)
            return Collections.emptyList();

        return super.checkPaths(c, table, svc, Collections.singleton(path));
    }
}
