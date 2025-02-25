package org.labkey.snd.query;

import org.labkey.api.data.TableInfo;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.util.ContainerContext;
import org.labkey.snd.SNDUserSchema;

abstract public class AbstractSNDTableInfo extends SimpleUserSchema.SimpleTable<SNDUserSchema>
{
    protected AbstractSNDTableInfo(SNDUserSchema schema, TableInfo dbtable)
    {
        super(schema, dbtable, null);
    }

    @Override
    public boolean supportsContainerFilter()
    {
        return false;
    }

    @Override
    public ContainerContext getContainerContext()
    {
        return getUserSchema().getContainer();
    }
}
