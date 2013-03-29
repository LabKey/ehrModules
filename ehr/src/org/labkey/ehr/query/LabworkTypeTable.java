package org.labkey.ehr.query;

import org.labkey.api.data.AbstractTableInfo;
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
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 3/27/13
 * Time: 6:20 PM
 */
public class LabworkTypeTable extends SimpleUserSchema.SimpleTable
{
    private String _label;
    private String _type;

    public static final String CACHE_KEY = LabworkTypeTable.class.getName() + "||types";
    private static final String TESTS_CACHE_KEY = LabworkTypeTable.class.getName() + "||testId";

    private static final String TEST_ID_FIELD = "testid";
    public LabworkTypeTable(UserSchema schema, SchemaTableInfo table, String tableName, String type)
    {
        super(schema, table);

        ColumnInfo col = table.getColumn("type");
        addCondition(col, type);

        _type = type;

        setName(tableName);
        setTitle(tableName);

        ColumnInfo valueCol = getColumn(TEST_ID_FIELD);
        valueCol.setNullable(false);

        ColumnInfo setCol = getColumn("type");
        if (setCol != null)
            removeColumn(setCol);

        ColumnInfo testId = getColumn(TEST_ID_FIELD);
        if (testId != null)
        {
            testId.setKeyField(true);
            getColumn("rowid").setKeyField(false);
        }

        LDKService.get().getDefaultTableCustomizer().customize(this);

        setInsertURL(AbstractTableInfo.LINK_DISABLER);
        setUpdateURL(AbstractTableInfo.LINK_DISABLER);
        setDeleteURL(AbstractTableInfo.LINK_DISABLER);
        setImportURL(AbstractTableInfo.LINK_DISABLER);
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new UpdateService(this);
    }

    private class UpdateService extends SimpleQueryUpdateService
    {
        private Set<String> _distinctValues = null;

        public UpdateService(SimpleUserSchema.SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        @Override
        protected Map<String, Object> getRow(User user, Container container, Map<String, Object> keys) throws InvalidKeyException, QueryUpdateServiceException, SQLException
        {
            if (!keys.containsKey("rowid") || keys.get("rowid") == null)
            {
                SimpleFilter filter = new SimpleFilter(FieldKey.fromString(TEST_ID_FIELD), keys.get(TEST_ID_FIELD), CompareType.EQUAL);
                TableSelector ts = new TableSelector(getQueryTable(), Collections.singleton("rowid"), filter, null);
                Object[] results = ts.getArray(Object.class);
                if (results.length == 0)
                    throw new InvalidKeyException("Existing row not found for value: " + keys.get(TEST_ID_FIELD));
                else if (results.length > 1)
                    throw new InvalidKeyException("More than one existing row found value: " + keys.get(TEST_ID_FIELD));

                keys.put("rowid", results[0]);
            }

            return super.getRow(user, container, keys);
        }

        @Override
        protected Map<String, Object> insertRow(User user, Container container, Map<String, Object> row) throws DuplicateKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            row.put("type", _type);

            String value = (String)row.get(TEST_ID_FIELD);
            if (value != null && rowExists(value))
                throw new ValidationException("There is already a record in the set '" + _type + "' with testid: " + value);

            normalizeAliases(row);
            return super.insertRow(user, container, row);
        }

        @Override
        protected Map<String, Object> updateRow(User user, Container container, Map<String, Object> row, Map<String, Object> oldRow) throws InvalidKeyException, ValidationException, QueryUpdateServiceException, SQLException
        {
            String oldValue = (String)oldRow.get(TEST_ID_FIELD);
            String newValue = (String)row.get(TEST_ID_FIELD);

            if (oldRow != null && newValue != null && !oldValue.equals(newValue) && rowExists(newValue))
                throw new ValidationException("There is already a record in the set '" + _type + "' with testid: " + newValue);

            if (!oldValue.equals(newValue))
                uncacheValue(oldValue);

            row.put("type", _type);
            normalizeAliases(row);
            return super.updateRow(user, container, row, oldRow);
        }

        private boolean rowExists(String value)
        {
            Set<String> distinctValues = getValues();

            boolean ret = getValues().contains(value);

            if (!distinctValues.contains(value))
                distinctValues.add(value);

            return ret;
        }

        private Set<String> getValues()
        {
            if (_distinctValues != null)
                return _distinctValues;

            _distinctValues = new HashSet<String>();

            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("type"), _type, CompareType.EQUAL);
            TableSelector ts = new TableSelector(_rootTable, Collections.singleton(TEST_ID_FIELD), filter, null);
            String[] existing = ts.getArray(String.class);
            _distinctValues.addAll(Arrays.asList(existing));

            return _distinctValues;
        }

        private void uncacheValue(String value)
        {
            Set<String> distinctValues = getValues();
            distinctValues.remove(value);
        }

        private void normalizeAliases(Map<String, Object> map)
        {
            if (map.get("aliases") != null)
            {
                String aliases = (String)map.get("aliases");

                //remove whitespace and punctutation
                aliases = aliases.replaceAll("\\s", "");
                aliases = aliases.replaceAll(";", ",");
                aliases = aliases.replaceAll(",+", ",");

                map.put("aliases", aliases);
            }
        }
    }
}


