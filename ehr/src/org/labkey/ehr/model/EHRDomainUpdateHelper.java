package org.labkey.ehr.model;

import org.labkey.api.data.Container;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;

public class EHRDomainUpdateHelper extends SimpleQueryUpdateService.SimpleDomainUpdateHelper
{
    public EHRDomainUpdateHelper(SimpleUserSchema.SimpleTable queryTable)
    {
        super(queryTable);
    }

    @Override
    public Container getDomainContainer(Container c)
    {
        return EHRDomainKind.getDomainContainer(c);
    }

    @Override
    public Container getDomainObjContainer(Container c)
    {
        return EHRDomainKind.getDomainContainer(c);
    }
}
