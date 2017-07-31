package org.labkey.ehr.query;
import org.labkey.api.data.Container;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.query.DefaultQueryUpdateService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleTableDomainKind;

/**
 * Created by rond on 7/26/2017.
 */
public class EHRProjectTable extends ContainerScopedTable
//public class EHRProtocolTable extends SimpleUserSchema.SimpleTable
{
    public EHRProjectTable(EHRUserSchema schema,TableInfo table)
    {
        super(schema, table,"protocol");
    }
    @Override
    public SimpleTableDomainKind getDomainKind()
    {
        if (getObjectUriColumn() == null)
            return null;

        return (EHRDomainKind)PropertyService.get().getDomainKindByName(EHRDomainKind.KIND_NAME);
    }

    @Override
    public Domain getDomain()
    {
        if (getObjectUriColumn() == null)
            return null;

        if (_domain == null)
        {
            String domainURI = getDomainURI();
            _domain = PropertyService.get().getDomain(EHRDomainKind.getDomainContainer(getContainer()), domainURI);
        }
        return _domain;
    }

    @Override
    public String getDomainURI()
    {
        if (getObjectUriColumn() == null)
            return null;

        return EHRDomainKind.getDomainURI(getUserSchema().getName(), getName(),
                EHRDomainKind.getDomainContainer(getContainer()),
                getUserSchema().getUser());
    }

    public QueryUpdateService getUpdateService()
    {
        TableInfo table = getRealTable();
        if (table != null)
        {
            DefaultQueryUpdateService.DomainUpdateHelper helper = new SimpleQueryUpdateService.SimpleDomainUpdateHelper(this)
            {
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
            };
            return new ContainerScopedTable.UpdateService(this, table, helper);
        }
        return null;
    }
}