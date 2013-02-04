package org.labkey.ehr.query;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;

import java.sql.SQLException;
import java.util.Collections;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 1/31/13
 * Time: 4:33 PM
 */
public class LookupSetTable extends SimpleUserSchema.SimpleTable
{
    private Map<String, Object> _map;
    private String _setName;

    public LookupSetTable(UserSchema schema, SchemaTableInfo table, String setName, Map<String, Object> map)
    {
        super(schema, table);

        ColumnInfo col = table.getColumn("set_name");
        addCondition(col, setName);

        _setName = setName;
        _map = map;

        setName(setName);
        if (map.containsKey("label"))
            setTitle((String)map.get("label"));

        if (map.containsKey("description"))
            setDescription((String) map.get("description"));

        ColumnInfo setCol = getColumn("set_name");
        if (setCol != null)
            removeColumn(setCol);

        LDKService.get().getDefaultTableCustomizer().customize(this);
    }

//    @Override
//    public DatabaseTableType getTableType()
//    {
//        return DatabaseTableType.TABLE;
//    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new LookupUpdateService(this);
    }

    private class LookupUpdateService extends SimpleQueryUpdateService
    {
        public LookupUpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        @Override
        protected Map<String, Object> getRow(User user, Container container, Map<String, Object> keys) throws InvalidKeyException, QueryUpdateServiceException, SQLException
        {
            return super.getRow(user,  container, keys);
        }

        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            row.put("setname", _setName);

            Object value = row.get("value");
            if (value != null && rowExists(container, value))
                throw new ValidationException("There is already a record in the set '" + _setName + "' with value: " + value);

            return super.insertRow(user, container, row);
        }

        @Override
        protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, Map<String, Object> oldRow) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            Object oldValue = oldRow.get("value");
            Object newValue = row.get("value");

            if (oldRow != null && newValue != null && !oldValue.equals(newValue) && rowExists(container,  newValue))
                throw new ValidationException("There is already a record in the set '" + _setName + "' with value: " + newValue);

            row.put("setname", _setName);
            return super.updateRow(user, container, row, oldRow);
        }

        private boolean rowExists(Container c, Object value)
        {
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("set_name"), _setName, CompareType.EQUAL);
            filter.addCondition(FieldKey.fromString("value"), value, CompareType.EQUAL);
            TableSelector ts = new TableSelector(_rootTable, Collections.singleton("value"), filter, null);
            return ts.getRowCount() > 0;
        }
    }
}


