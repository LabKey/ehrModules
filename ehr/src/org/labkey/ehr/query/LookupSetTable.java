package org.labkey.ehr.query;

import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.DataLoader;
import org.labkey.api.security.User;
import org.labkey.api.util.FileStream;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

        ColumnInfo valueCol = getColumn("value");
        valueCol.setNullable(false);

        if (map.containsKey("keyField") && map.get("keyField") != null)
        {
            ColumnInfo keyCol = getColumn((String)map.get("keyField"));
            if (keyCol != null)
            {
                keyCol.setKeyField(true);
                getColumn("rowid").setKeyField(false);
            }

        }

        setTitleColumn("value");
        if (map.containsKey("titleColumn") && map.get("titleColumn") != null)
        {
            ColumnInfo titleCol = getColumn((String)map.get("titleColumn"));
            if (titleCol != null)
            {
                setTitleColumn(titleCol.getName());
            }
        }

        ColumnInfo setCol = getColumn("set_name");
        if (setCol != null)
            removeColumn(setCol);

        LDKService.get().getDefaultTableCustomizer().customize(this);

        setInsertURL(AbstractTableInfo.LINK_DISABLER);
        setUpdateURL(AbstractTableInfo.LINK_DISABLER);
        setDeleteURL(AbstractTableInfo.LINK_DISABLER);
        setImportURL(AbstractTableInfo.LINK_DISABLER);
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
        private Set<String> _distinctValues = null;
        
        public LookupUpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        @Override
        protected Map<String, Object> getRow(User user, Container container, Map<String, Object> keys) throws InvalidKeyException, QueryUpdateServiceException, SQLException
        {
            if (!keys.containsKey("rowid") || keys.get("rowid") == null)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString("value"), keys.get("value"), CompareType.EQUAL);
                //FieldKey.fromString("set_name"), _setName);
                TableSelector ts = new TableSelector(getQueryTable(), Collections.singleton("rowid"), filter, null);
                Object[] results = ts.getArray(Object.class);
                if (results.length == 0)
                    throw new InvalidKeyException("Existing row not found for value: " + keys.get("value"));
                else if (results.length > 1)
                    throw new InvalidKeyException("More than one existing row found value: " + keys.get("value"));

                keys.put("rowid", results[0]);
            }

            return super.getRow(user, container, keys);
        }

        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            row.put("set_name", _setName);

            String value = (String)row.get("value");
            if (value != null && rowExists(value))
                throw new ValidationException("There is already a record in the set '" + _setName + "' with value: " + value);

            return super.insertRow(user, container, row);
        }

        @Override
        protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, Map<String, Object> oldRow) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            String oldValue = (String)oldRow.get("value");
            String newValue = (String)row.get("value");

            if (oldRow != null && newValue != null && !oldValue.equals(newValue) && rowExists(newValue))
                throw new ValidationException("There is already a record in the set '" + _setName + "' with value: " + newValue);

            if (!oldValue.equals(newValue))
                _distinctValues.remove(oldValue);

            row.put("set_name", _setName);
            return super.updateRow(user, container, row, oldRow);
        }

        private boolean rowExists(String value)
        {
            if (_distinctValues == null)
                initValueCache();

            boolean ret = _distinctValues.contains(value);

            if (!_distinctValues.contains(value))
                _distinctValues.add(value);

            return ret;
        }

        private void initValueCache()
        {
            _distinctValues = new HashSet<String>();

            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("set_name"), _setName, CompareType.EQUAL);
            TableSelector ts = new TableSelector(_rootTable, Collections.singleton("value"), filter, null);
            String[] existing = ts.getArray(String.class);
            _distinctValues.addAll(Arrays.asList(existing));
        }
    }
}


