package org.labkey.snd;

import org.apache.commons.collections4.MultiValuedMap;
import org.apache.commons.collections4.multimap.AbstractMultiValuedMap;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.collections.CaseInsensitiveTreeSet;
import org.labkey.api.collections.IntHashMap;
import org.labkey.api.data.AbstractTableInfo;
import org.labkey.api.data.BaseColumnInfo;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.dialect.SqlDialect;
import org.labkey.api.exp.PropertyColumn;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.query.AliasedColumn;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.SchemaKey;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.User;
import org.labkey.api.snd.SNDDomainKind;
import org.labkey.api.sql.LabKeySql;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Consumer;

import static org.labkey.api.query.ExprColumn.STR_TABLE_ALIAS;

public class PackageUserSchema extends UserSchema
{
    public static final String SCHEMA_NAME = "Packages";

    final SNDUserSchema _snd;

    public PackageUserSchema(SNDUserSchema parent)
    {
        super(new SchemaKey(parent.getSchemaPath(), SCHEMA_NAME), null, parent.getUser(), parent.getContainer(), parent.getDbSchema(), null);
        _snd = parent;
    }

    @Override
    public Set<String> getSchemaNames()
    {
        return Set.of();
    }

    @Override
    public Set<String> getTableNames()
    {
        List<String> list = new ArrayList<>();
        visitAll(p -> {if (!p.superPkgIds.isEmpty()) list.add(p.description);});

        // check for duplicates
        Set<String> duplicates = new CaseInsensitiveHashSet();
        Set<String> ret = new CaseInsensitiveTreeSet();
        for (String s : list)
            if (!ret.add(s))
                duplicates.add(s);
        ret.removeAll(duplicates);

        return ret;
    }


    @Override
    public @Nullable TableInfo createTable(String name, ContainerFilter cf)
    {
        return createPackageTable(name);
    }


    PackageTableInfo createPackageTable(String name)
    {
        // find domain for name
        Map<Integer,Package> pkgs = new IntHashMap<>();
        visitAll(p -> {
            if (name.equalsIgnoreCase(p.description))
                pkgs.put(p.packageId, p);
        });
        if (1 != pkgs.size())
            return null;
        var entry = pkgs.entrySet().iterator().next();
        int packageId = entry.getKey();
        String description = entry.getValue().description;
        TableInfo eventData = _snd.getTable("EventData", null, true, true);
        if (null == eventData)
            return null;
        return new PackageTableInfo(this, eventData, description, packageId);
    }


    PackageTableInfo createPackageTable(Package pkg)
    {
        int packageId = pkg.packageId;
        String description = pkg.description;
        TableInfo eventData = _snd.getTable("EventData", null, true, true);
        if (null == eventData)
            return null;
        return new PackageTableInfo(this, eventData, description, packageId);
    }


    abstract static class _AbstractTableInfo extends AbstractTableInfo
    {
        final @NotNull UserSchema userSchema;

        _AbstractTableInfo(@NotNull UserSchema schema, String name)
        {
            super(schema.getDbSchema(), name);
            userSchema = schema;
        }

        @Override
        public @NotNull UserSchema getUserSchema()
        {
            return userSchema;
        }

        public MutableColumnInfo addWrapColumn(TableInfo table, String name, ColumnInfo column)
        {
            assert column.getParentTable() == table : "Column is not from the same \"real\" table";
            BaseColumnInfo ret = new AliasedColumn(this, name, column);
            ret.setHidden(column.isHidden());
            addColumn(ret);
            return ret;
        }

        public void addWrapAllColumns(TableInfo table)
        {
            for (var col : table.getColumns())
            {
                addWrapColumn(table, col.getName(), col);
            }
        }
    }


    class PackageTableInfo extends _AbstractTableInfo
    {
        final int packageId;
        final TableInfo eventData;

        PackageTableInfo(PackageUserSchema schema, TableInfo eventData, String packageName, int packageId)
        {
            super(schema, packageName);
            setName(packageName);
            this.packageId = packageId;
            this.eventData = eventData;
        }


        /* TODO: duplicate code StudyUtils is not public (add to Study class?) */
        public static SQLFragment sequenceNumFromDateSQL(SqlDialect dialect, SQLFragment dateSql)
        {
            // SqlDialect.getDatePart() should not convert SQLFragment to String
            if (!dateSql.getParams().isEmpty())
                throw new IllegalStateException();
            // Returns a SQL statement that produces a single number from a date, in the form of YYYYMMDD.
            SQLFragment sql = new SQLFragment();
            sql.append("CAST((10000 * ").append(dialect.getDatePart(Calendar.YEAR, dateSql)).append(") + ");
            sql.append("(100 * ").append(dialect.getDatePart(Calendar.MONTH, dateSql)).append(") + ");
            sql.append("(").append(dialect.getDatePart(Calendar.DAY_OF_MONTH, dateSql)).append(") AS NUMERIC(15,4))");
            return sql;
        }

        @Override
        protected void initializeColumns()
        {
            TableInfo events = getSchema().getTable("Events");

            addColumn(new AliasedColumn(this, "SubjectId", events.getColumn("SubjectId")));
            addColumn(new AliasedColumn(this, "Date", events.getColumn("Date")));
            addColumn(new AliasedColumn(this, "QcState", events.getColumn("QcState")));
            var date = new SQLFragment(events.getColumn("Date").getValueSql(STR_TABLE_ALIAS));
            var seqnumSQL = sequenceNumFromDateSQL(getDbSchema().getSqlDialect(), date);
            var seqnumCol = new ExprColumn(this, "SequenceNum", seqnumSQL, JdbcType.DECIMAL);
            seqnumCol.setHidden(true);
            addColumn(seqnumCol);

            addWrapAllColumns(eventData);

            Package p = getPackage(packageId);

            Container c = getUserSchema().getContainer();
            User user = getUserSchema().getUser();
            ColumnInfo object = Objects.requireNonNull(getColumn("ObjectURI", false));
            if (p.domain != null)
            {
                for (DomainProperty dp : p.domain.getProperties())
                {
                    if (null == getColumn(dp.getName(), false))
                    {
                        PropertyColumn column = new PropertyColumn(dp.getPropertyDescriptor(), object, c, user, false);
                        addColumn(column);
                    }
                }
            }
        }

        static Set<String> eventDataCols = CaseInsensitiveHashSet.of("subjectid", "date", "qcstate", "sequencenum");

        @Override
        protected SQLFragment getFromSQLExpanded(String alias, Set<FieldKey> cols)
        {
            boolean hasEventDataColumn = cols.stream().anyMatch(fk -> eventDataCols.contains(fk.getParts().get(0)));
            return getFromSQLJoin(alias, hasEventDataColumn);
        }

        @Override
        public @NotNull SQLFragment getFromSQL(String alias)
        {
            return getFromSQLJoin(alias, true);
        }

        @Override
        public @NotNull SQLFragment getFromSQL()
        {
            throw new IllegalStateException();
        }

        public @NotNull SQLFragment getFromSQLJoin(String alias, boolean withEventJoin)
        {
            SqlDialect dialect = getDbSchema().getSqlDialect();
            var me = getPackage(packageId);
            TableInfo events = getSchema().getTable("Events");
            var fromSql =  new SQLFragment("(SELECT ");
            if (withEventJoin)
                fromSql.append("events.SubjectId, events.Date, events.QcState, ");
            fromSql.append("eventdata.*\n");
            fromSql.append("FROM ").append(eventData.getFromSQL("eventdata"));
            if (withEventJoin)
                fromSql.append(" INNER JOIN ").append(events.getFromSQL("events")).append( " ON eventdata.eventid = events.eventid\n");
            fromSql.append("WHERE eventdata.Container=").appendValue(getContainer());
            if (null == me || me.superPkgIds.isEmpty())
                fromSql.append(" AND (0=1)");
            else
            {
                fromSql.append(" AND SuperPkgId ");
                dialect.appendInClauseSql(fromSql, me.superPkgIds);
            }
            return fromSql.append(") ").append(alias).append("\n");
        }
    }


    /*
     * Package helpers
     * CONSIDER: move to a cache in SNDManager
     */

    public record SuperPkg(int superPkgId, Integer parentSuperPkgId, int pkgId, String description) {}
    public static class Package
    {
        Package(int packageId, String description, Domain d)
        {
            this.packageId = packageId;
            this.description = description;
            this.domain = d;
        }
        final int packageId;
        final String description;
        final Domain domain;
        List<Integer> superPkgIds = new ArrayList<>();
    }
    Map<Integer,Package> packagesMap;

    void initPackages()
    {
        if (null == packagesMap)
        {
            List<SuperPkg> supers = new SqlSelector(getDbSchema(), new SQLFragment(
                    new SQLFragment("SELECT SuperPkgId, ParentSuperPkgId, Pkgs.PkgId, Description FROM snd.Pkgs INNER JOIN snd.SuperPkgs ON Pkgs.PkgId = SuperPkgs.PkgId WHERE Pkgs.Container = ").appendValue(getContainer())
            )).getArrayList(SuperPkg.class);
            Map<Integer, Package> map = new IntHashMap<>();
            supers.forEach(superPkg -> {
                var package_ = map.computeIfAbsent(superPkg.pkgId, id ->
                {
                    String uri = SNDDomainKind.formatSndDomainURI(getContainer().getRowId(), superPkg.pkgId);
                    var domain = PropertyService.get().getDomain(getContainer(), uri);
                    return new Package(superPkg.pkgId, superPkg.description, domain);
                });
                package_.superPkgIds.add(superPkg.superPkgId);
            });
            packagesMap = map;
        }
    }

    Package getPackage(int id)
    {
        initPackages();
        return packagesMap.get(id);
    }

    void visitAll(Consumer<Package> fn)
    {
        initPackages();
        packagesMap.values().forEach(fn);
    }


    TableInfo createCategoryTable(UserSchema categoriesSchema, int categoryId, String name)
    {
        // use getTableNames() as it does duplicate description detection
        Set<String> tableNames = new HashSet<>(getTableNames());
        // get a tableInfo for each packages in category
        List<PackageTableInfo> pkgs = new SqlSelector(getDbSchema(), new SQLFragment("SELECT DISTINCT PkgId FROM snd.PkgCategoryJunction WHERE CategoryId=").appendValue(categoryId))
                .stream(Integer.class)
                .map(I -> getPackage(I.intValue()))
                .filter(pkg -> null != pkg && tableNames.contains(pkg.description))
                .map(this::createPackageTable)
                .toList();
        if (pkgs.isEmpty())
            return null;

        // This is _almost_ ArrayListValuedHashMap, but I want to track the keyset insertion order.
        MultiValuedMap<FieldKey, ColumnInfo> map = new AbstractMultiValuedMap<>(new LinkedHashMap<>())
        {
            @Override
            protected Collection<ColumnInfo> createCollection()
            {
                return new ArrayList<>();
            }
        };
        for (TableInfo t : pkgs)
        {
            for (ColumnInfo col : t.getColumns())
            {
                // CONSIDER: consider optimize the snd.evens join by hoisting it out of the UNION
                // e.g.  if (PackageTableInfo.eventDataCols.contains(col.getName())) continue;
                map.put(col.getFieldKey(), col);
            }
        }
        var keys = new HashSet<>(map.keySet());
        keys.forEach(key -> {
            var coll = map.get(key);
            if (coll.size() != pkgs.size())
            {
                map.remove(key);
                return;
            }
            var opt = coll.stream().findFirst();
            final var jdbcType = opt.isPresent() ? opt.get().getJdbcType() : JdbcType.OTHER;
            var allMatch = coll.stream().allMatch(c -> jdbcType == c.getJdbcType());
            if (!allMatch)
                map.remove(key);
        });
        if (map.isEmpty())
            return null;

        return new CategoriesTable(categoriesSchema, categoryId, name, pkgs, map);
    }

    public class CategoriesTable extends _AbstractTableInfo
    {
        final int categoryId;
        final List<PackageTableInfo> pkgTables;
        final MultiValuedMap<FieldKey,ColumnInfo> columnMap;
        TableInfo queryTableInfo = null;

        CategoriesTable(UserSchema categoriesSchema, int categoryId, String name, List<PackageTableInfo> pkgs, MultiValuedMap<FieldKey,ColumnInfo> columnMap)
        {
            super(categoriesSchema, name);
            this.categoryId = categoryId;
            this.pkgTables = pkgs;
            this.columnMap = columnMap;
        }

        @Override
        protected void initializeColumns()
        {
            var hidden = CaseInsensitiveHashSet.of("Container", "LSID", "ObjectId", "ObjectURI", "SequenceNum");

            // It's unfortunate that SND doesn't share property descriptors, we have to UNION each "package" table to get the "category" table.
            // this is LabKey SQL (not using SQLFragment for this)
            StringBuilder lkUnionSQL = new StringBuilder();
            var unionAll = "";
            var colNames = columnMap.keySet().toArray(new FieldKey[0]);
            for (PackageTableInfo pkgTable : pkgTables)
            {
                lkUnionSQL.append(unionAll);
                unionAll = "\nUNION ALL\n";
                var comma = "";
                lkUnionSQL.append("SELECT ");
                for (FieldKey colName : colNames)
                {
                    lkUnionSQL.append(comma);
                    comma = ", ";
                    lkUnionSQL.append(LabKeySql.quoteIdentifier(colName.getName()));
                    // LabKey SQL unhides columns by default
                    if (hidden.contains(colName.getName()))
                        lkUnionSQL.append(" @hidden");
                }
                lkUnionSQL.append("\nFROM ").append("Packages.").append(LabKeySql.quoteIdentifier(pkgTable.getName()));
            }

            var qdef = QueryService.get().createQueryDef(getUser(), getContainer(), _snd, "_union_");
            qdef.setSql(lkUnionSQL.toString());
            List<QueryException> errors = new ArrayList<>();
            queryTableInfo = qdef.getTable(_snd, errors, false);
            if (!errors.isEmpty())
                throw errors.get(0);
            if (null == queryTableInfo)
                throw new QueryException("Unexpected error compiling query");

            addWrapAllColumns(queryTableInfo);
        }

        @Override
        public @NotNull SQLFragment getFromSQL(String alias)
        {
            return queryTableInfo.getFromSQL(alias);
        }

        @Override
        protected SQLFragment getFromSQL()
        {
            throw new IllegalStateException();
        }
    }
}
