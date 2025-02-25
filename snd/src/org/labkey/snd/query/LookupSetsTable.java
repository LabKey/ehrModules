package org.labkey.snd.query;

import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.SimpleUserSchema.SimpleTable;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;

public class LookupSetsTable extends SimpleTable<SNDUserSchema> {

    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     * @param schema
     * @param table
     */
    public LookupSetsTable(SNDUserSchema schema, TableInfo table, ContainerFilter cf) { super(schema, table, cf); }

    @Override
    public LookupSetsTable init() {
        super.init();

        SQLFragment isInUseQuery = new SQLFragment();
        isInUseQuery.append("(CASE WHEN EXISTS (SELECT ls.SetName FROM ");
        isInUseQuery.append(SNDSchema.getInstance().getTableInfoLookupSets(), "ls");
        isInUseQuery.append(" INNER JOIN ");
        isInUseQuery.append(_userSchema.getTable("PackageAttribute").getFromSQL("pa"));
        isInUseQuery.append(" ON ls.SetName = pa.LookupQuery ");
        isInUseQuery.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".LookupSetId = ls.LookupSetId) ");
        isInUseQuery.append(" THEN 'true' else 'false' END)");
        ExprColumn isInUseColumn = new ExprColumn(this, "IsInUse", isInUseQuery, JdbcType.BOOLEAN);
        addColumn(isInUseColumn);

        return this;
    }

}

