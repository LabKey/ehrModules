/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.labkey.snd.query;

import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.DomainNotFoundException;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainUtil;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.gwt.client.model.GWTDomain;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.SimpleQueryUpdateService;
import org.labkey.api.query.SimpleUserSchema.SimpleTable;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.User;
import org.labkey.api.snd.Package;
import org.labkey.api.snd.PackageDomainKind;
import org.labkey.api.snd.SNDService;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * Created by marty on 8/23/2017.
 */
public class PackagesTable extends AbstractSNDTableInfo
{

    /**
     * Create the simple table.
     * SimpleTable doesn't add columns until .init() has been called to allow derived classes to fully initialize themselves before adding columns.
     *
     * @param schema
     * @param table
     */
    public PackagesTable(SNDUserSchema schema, TableInfo table)
    {
        super(schema, table);
    }

    @Override
    public PackagesTable init()
    {
        super.init();

        SQLFragment hasDataSql = new SQLFragment();
        hasDataSql.append("(CASE WHEN EXISTS (SELECT sp.PkgId FROM ");
        hasDataSql.append(SNDSchema.getInstance().getTableInfoSuperPkgs(), "sp");
        hasDataSql.append(" JOIN ");
        hasDataSql.append(SNDSchema.getInstance().getTableInfoEventData(), "ce");
        hasDataSql.append(" ON sp.SuperPkgId = ce.SuperPkgId");
        hasDataSql.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".PkgId = sp.PkgId)");
        hasDataSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn hasDataCol = new ExprColumn(this, "HasEvent", hasDataSql, JdbcType.BOOLEAN);
        addColumn(hasDataCol);

        SQLFragment inUseSql = new SQLFragment();
        inUseSql.append("(CASE WHEN EXISTS (SELECT sp.PkgId FROM ");
        inUseSql.append(SNDSchema.getInstance().getTableInfoSuperPkgs(), "sp");
        inUseSql.append(" JOIN ");
        inUseSql.append(SNDSchema.getInstance().getTableInfoProjectItems(), "pi");
        inUseSql.append(" ON sp.SuperPkgId = pi.SuperPkgId");
        inUseSql.append(" WHERE " + ExprColumn.STR_TABLE_ALIAS + ".PkgId = sp.PkgId)");
        inUseSql.append(" THEN 'true' ELSE 'false' END)");
        ExprColumn inUseCol = new ExprColumn(this, "HasProject", inUseSql, JdbcType.BOOLEAN);
        addColumn(inUseCol);

        return this;
    }

    public boolean isPackageInUse(int pkgId)
    {
        Set<String> cols = Collections.singleton("HasEvent");
        TableSelector ts = new TableSelector(this, cols, new SimpleFilter(FieldKey.fromString("PkgId"), pkgId), null);
        Map<String, Object> ret = ts.getMap();

        return Boolean.parseBoolean((String) ret.get("HasEvent"));
    }

    @Override
    public QueryUpdateService getUpdateService()
    {
        return new PackagesTable.UpdateService(this);
    }

    protected class UpdateService extends SimpleQueryUpdateService
    {
        public UpdateService(SimpleTable ti)
        {
            super(ti, ti.getRealTable());
        }

        @Override
        public List<Map<String, Object>> insertRows(User user, Container container, List<Map<String, Object>> rows, BatchValidationException errors, @Nullable Map<Enum, Object> configParameters, Map<String, Object> extraScriptContext) throws DuplicateKeyException, QueryUpdateServiceException, SQLException
        {
            int pkgId;
            String description;
            GWTDomain<GWTPropertyDescriptor> newDomain;

            // Create domain for each package
            for (Map<String, Object> row : rows)
            {
                pkgId = (Integer) row.get("pkgId");
                description = (String) row.get("description");

                newDomain = new GWTDomain<>();
                newDomain.setName(SNDManager.getPackageName(pkgId));
                newDomain.setContainer(container.getId());
                newDomain.setDescription(description);

                try
                {
                    DomainUtil.createDomain(PackageDomainKind.getPackageKindName(), newDomain, null, container, user, null, null);
                }
                catch (ValidationException ve)
                {
                    throw new QueryUpdateServiceException(ve);
                }

            }

            return super.insertRows(user, container, rows, errors, configParameters, extraScriptContext);
        }

        @Override
        protected Map<String, Object> deleteRow(User user, Container container, Map<String, Object> oldRowMap) throws QueryUpdateServiceException, SQLException, InvalidKeyException
        {
            int pkgId = (Integer) oldRowMap.get("PkgId");
            if (isPackageInUse(pkgId))
                throw new QueryUpdateServiceException("Package in use, cannot delete.");

            String domainName = SNDManager.getPackageName(pkgId);
            Domain domain = PropertyService.get().getDomain(getDomainContainer(container), PackageDomainKind.getDomainURI(SNDSchema.NAME, domainName, container, user));
            if (domain == null)
                throw new QueryUpdateServiceException("Package domain not found.");

            try (DbScope.Transaction tx = SNDSchema.getInstance().getSchema().getScope().ensureTransaction(SNDService.get().getWriteLock()))
            {
                SNDManager.get().deletePackageCategories(container, user, pkgId);

                try
                {
                    domain.delete(user);
                }
                catch (DomainNotFoundException e)
                {
                    throw new QueryUpdateServiceException(e);
                }

                // get all super packages for this package and delete them (if they exist)
                UserSchema schema = SNDManager.getSndUserSchema(container, user);
                TableInfo superPkgsTable = getTableInfo(schema, SNDSchema.SUPERPKGS_TABLE_NAME);
                QueryUpdateService superPkgQus = getQueryUpdateService(superPkgsTable);
                List<Map<String, Object>> superPkgRows = new ArrayList<>();
                List<Integer> superPkgIds = SNDManager.getSuperPkgIdsForPkg(container, user, pkgId);
                if (superPkgIds != null)
                {
                    for (Integer superPkgId : superPkgIds)
                    {
                        Map<String, Object> superPkgRow = new HashMap<>();
                        superPkgRow.put("SuperPkgId", superPkgId);
                        superPkgRows.add(superPkgRow);
                    }
                    try
                    {
                        superPkgQus.deleteRows(user, container, superPkgRows, null, null);
                    }
                    catch (BatchValidationException e)
                    {
                        throw new QueryUpdateServiceException(e);
                    }
                }
                tx.commit();
            }
            // now delete package row
            return super.deleteRow(user, container, oldRowMap);
        }

        private TableInfo getTableInfo(@NotNull UserSchema schema, @NotNull String table)
        {
            TableInfo tableInfo = schema.getTable(table);
            if (tableInfo == null)
                throw new IllegalStateException(table + " TableInfo not found");

            return tableInfo;
        }

        private QueryUpdateService getQueryUpdateService(@NotNull TableInfo table)
        {
            QueryUpdateService qus = table.getUpdateService();
            if (qus == null)
                throw new IllegalStateException(table.getName() + " query update service");

            return qus;
        }

        @Override
        protected Map<String, Object> getRow(User user, Container container, Map<String, Object> keys) throws InvalidKeyException, QueryUpdateServiceException, SQLException
        {
            Map<String, Object> row = super.getRow(user, container, keys);

            if (row != null)
            {
                Set<String> cols = new HashSet<>();
                cols.add("HasEvent");
                cols.add("HasProject");
                Map<String, Object> map = new TableSelector(this.getQueryTable(), cols, new SimpleFilter(FieldKey.fromString("PkgId"), row.get("PkgId")), null).getMap();
                row.put(Package.PKG_HASEVENT, Boolean.parseBoolean((String) map.get(Package.PKG_HASEVENT)));
                row.put(Package.PKG_HASPROJECT, Boolean.parseBoolean((String) map.get(Package.PKG_HASPROJECT)));
            }

            return row;
        }

    }
}
