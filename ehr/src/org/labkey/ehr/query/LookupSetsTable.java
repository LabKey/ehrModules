package org.labkey.ehr.query;

import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.ehr.dataentry.DataEntryManager;

import java.sql.SQLException;

/**
 * This TableInfo is for the actual ehr.lookupsets table. It is not a duplicate of LookupSetTable which
 * is for the virtual tables created from the data in ehr.lookupsets.
 */
public class LookupSetsTable<SchemaType extends UserSchema> extends ContainerScopedTable<SchemaType>
{
    public LookupSetsTable(SchemaType schema, TableInfo st, ContainerFilter cf, String newPk)
    {
        super(schema, st, cf, newPk);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new UpdateService(this);
    }

    private class UpdateService extends ContainerScopedTable<SchemaType>.UpdateService
    {
        public UpdateService(SimpleUserSchema.SimpleTable<SchemaType> ti)
        {
            super(ti);
        }

        @Override
        protected void afterInsertUpdate(int count, BatchValidationException errors)
        {
            DataEntryManager.get().getCache().clear();
        }

        @Override
        protected int truncateRows(User user, Container container) throws QueryUpdateServiceException, SQLException
        {
            int i = super.truncateRows(user, container);
            DataEntryManager.get().getCache().clear();
            return i;
        }
    }
}
