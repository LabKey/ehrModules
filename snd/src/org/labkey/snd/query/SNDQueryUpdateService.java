package org.labkey.snd.query;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.dataiterator.DataIteratorBuilder;
import org.labkey.api.dataiterator.DataIteratorContext;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.security.User;

import java.util.Map;

public class SNDQueryUpdateService extends SimpleQueryUpdateService
{
    public SNDQueryUpdateService(SimpleUserSchema.SimpleTable queryTable, TableInfo dbTable)
    {
        super(queryTable, dbTable);
    }

    // Most of the SND tables have custom operations associated with mergeRows or importRows. loadRows also needs
    // to execute that custom logic.  For example when rows are loaded via ETL merge, loadRows is called
    // and the custom table logic for merging should be executed.
    @Override
    public int loadRows(User user, Container container, DataIteratorBuilder rows, DataIteratorContext context, @Nullable Map<String, Object> extraScriptContext)
    {
        if (context.getInsertOption() == QueryUpdateService.InsertOption.MERGE || context.getInsertOption() == QueryUpdateService.InsertOption.REPLACE)
        {
            return mergeRows(user, container, rows, context.getErrors(), context.getConfigParameters(), extraScriptContext);
        }
        else
        {
            return importRows(user, container, rows, context.getErrors(), context.getConfigParameters(), extraScriptContext);
        }
    }
}
