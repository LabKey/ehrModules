package org.labkey.snd.query;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.JdbcType;
import org.labkey.api.data.MutableColumnInfo;
import org.labkey.api.data.RenderContext;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.TableInfo;
import org.labkey.api.defaults.DefaultValueService;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.property.PropertyService;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.query.ExprColumn;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.LookupForeignKey;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.UserPrincipal;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.snd.PackageDomainKind;
import org.labkey.api.util.HtmlString;
import org.labkey.snd.SNDManager;
import org.labkey.snd.SNDSchema;
import org.labkey.snd.SNDUserSchema;
import org.labkey.snd.security.permissions.SNDViewerPermission;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PackageAttributeTable extends FilteredTable<SNDUserSchema>
{
    public PackageAttributeTable(@NotNull SNDUserSchema userSchema, ContainerFilter cf)
    {
        super(OntologyManager.getTinfoPropertyDescriptor(), userSchema, cf);

        setName(SNDUserSchema.TableType.PackageAttribute.name());
        setDescription("Package/attributes, one row per package/attribute combination.");

        ExprColumn pkgId = new ExprColumn(this, "pkgId", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgId"), JdbcType.INTEGER);
        addColumn(pkgId);

        ExprColumn pkgDescription = new ExprColumn(this, "pkgDescription", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgDescription"), JdbcType.VARCHAR);
        addColumn(pkgDescription);

        ExprColumn pkgActive = new ExprColumn(this, "pkgActive", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgActive"), JdbcType.BOOLEAN);
        addColumn(pkgActive);

        ExprColumn pkgRepeatable = new ExprColumn(this, "pkgRepeatable", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgRepeatable"), JdbcType.BOOLEAN);
        addColumn(pkgRepeatable);

        ExprColumn pkgQcState = new ExprColumn(this, "pkgQcState", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgQcState"), JdbcType.INTEGER);
        LookupForeignKey fk = new LookupForeignKey("RowId", "Label") {
            @Override
            public TableInfo getLookupTableInfo() {
                return CoreSchema.getInstance().getTableInfoUsers();
            }
        };
        pkgQcState.setFk(fk);
        addColumn(pkgQcState);

        ExprColumn pkgModified = new ExprColumn(this, "pkgModified", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgModified"), JdbcType.DATE);
        addColumn(pkgModified);

        ExprColumn pkgModifiedBy = new ExprColumn(this, "pkgModifiedBy", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgModifiedBy"), JdbcType.INTEGER);
        fk = new LookupForeignKey("UserId", "DisplayName") {
            @Override
            public TableInfo getLookupTableInfo() {
                return CoreSchema.getInstance().getTableInfoUsers();
            }
        };
        pkgModifiedBy.setFk(fk);
        addColumn(pkgModifiedBy);

        ExprColumn pkgCreated = new ExprColumn(this, "pkgCreated", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgCreated"), JdbcType.DATE);
        addColumn(pkgCreated);

        ExprColumn pkgCreatedBy = new ExprColumn(this, "pkgCreatedBy", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgCreatedBy"), JdbcType.INTEGER);
        fk = new LookupForeignKey("UserId", "DisplayName") {
            @Override
            public TableInfo getLookupTableInfo() {
                return CoreSchema.getInstance().getTableInfoUsers();
            }
        };
        pkgCreatedBy.setFk(fk);
        addColumn(pkgCreatedBy);

        List<GWTPropertyDescriptor> pds = SNDManager.getExtraFields(getContainer(), getUserSchema().getUser(), SNDSchema.PKGS_TABLE_NAME);
        for (GWTPropertyDescriptor pd : pds)
        {
            addColumn(getExtensibleColumnInfo(pd));
        }

        wrapAllColumns(true);

        ExprColumn required = new ExprColumn(this, "required", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".required"), JdbcType.BOOLEAN);
        addColumn(required);

        ExprColumn validatorName = new ExprColumn(this, "validatorName", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".validatorName"), JdbcType.VARCHAR);
        addColumn(validatorName);

        ExprColumn validatorTypeURI = new ExprColumn(this, "validatorTypeURI", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".validatorTypeURI"), JdbcType.VARCHAR);
        addColumn(validatorTypeURI);

        ExprColumn validatorExpression = new ExprColumn(this, "validatorExpression", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".validatorExpression"), JdbcType.VARCHAR);
        addColumn(validatorExpression);

        addColumn(getDefaultColumnInfo());

    }

    private MutableColumnInfo getDefaultColumnInfo()
    {
        ExprColumn defaultCol = new ExprColumn(this, "defaultValue", new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgId"), JdbcType.VARCHAR);
        defaultCol.setDisplayColumnFactory(new DisplayColumnFactory()
        {
            @Override
            public DisplayColumn createRenderer(ColumnInfo colInfo)
            {
                return new DataColumn(colInfo)
                {
                    @Override
                    public Object getValue(RenderContext ctx)
                    {
                        Integer pkgId = (Integer)super.getValue(ctx);
                        Integer propId = (Integer)ctx.get("propertyId");
                        Domain domain = PropertyService.get().getDomain(getContainer(), PackageDomainKind.getDomainURI(SNDSchema.NAME, SNDManager.getPackageName(pkgId), getContainer(), getUserSchema().getUser()));
                        Map<DomainProperty, Object> defaults = DefaultValueService.get().getDefaultValues(getContainer(), domain);
                        Object value = null;
                        for (DomainProperty domainProperty : defaults.keySet())
                        {
                            if (domainProperty.getPropertyId() == propId)
                            {
                                value = defaults.get(domainProperty);
                            }
                        }
                        return value;
                    }

                    @Override
                    public Object getDisplayValue(RenderContext ctx)
                    {
                        return getValue(ctx);
                    }

                    @NotNull
                    @Override
                    public HtmlString getFormattedHtml(RenderContext ctx)
                    {
                        Object value = getDisplayValue(ctx);
                        return value == null ? HtmlString.EMPTY_STRING : HtmlString.of(value.toString());
                    }
                };
            }
        });

        return defaultCol;
    }

    private MutableColumnInfo getExtensibleColumnInfo(GWTPropertyDescriptor pd)
    {
        QueryUpdateService pkgQus = SNDManager.getSndUserSchema(getContainer(), getUserSchema().getUser()).getTable(SNDUserSchema.TableType.Pkgs.name()).getUpdateService();

        ExprColumn extraCol = new ExprColumn(this, pd.getName(), new SQLFragment(ExprColumn.STR_TABLE_ALIAS + ".pkgId"), JdbcType.INTEGER);
        extraCol.setDisplayColumnFactory(new DisplayColumnFactory()
        {
            @Override
            public DisplayColumn createRenderer(ColumnInfo colInfo)
            {
                return new DataColumn(colInfo)
                {
                    @Override
                    public Object getValue(RenderContext ctx)
                    {
                        Integer pkgId = (Integer)super.getValue(ctx);
                        try
                        {
                            List<Map<String, Object>> keys = new ArrayList<>();
                            Map<String, Object> key = new HashMap<>();
                            key.put("PkgId", pkgId);
                            keys.add(key);

                            List<Map<String, Object>> rows = pkgQus.getRows(getUserSchema().getUser(), getContainer(), keys);
                            Map<String, Object> row = rows.get(0);
                            return row.get(pd.getName());
                        }
                        catch (QueryUpdateServiceException | InvalidKeyException | SQLException e)
                        {
                            throw new RuntimeException(e);
                        }
                    }

                    @Override
                    public Object getDisplayValue(RenderContext ctx)
                    {
                        return getValue(ctx);
                    }

                    @NotNull
                    @Override
                    public HtmlString getFormattedHtml(RenderContext ctx)
                    {
                        Object value = getDisplayValue(ctx);
                        return value == null ? HtmlString.EMPTY_STRING : HtmlString.of(value.toString());
                    }
                };
            }
        });

        return extraCol;
    }

    @Override
    @NotNull
    public SQLFragment getFromSQL(String alias)
    {
        SQLFragment sql = new SQLFragment("(SELECT pkg.pkgId, pkg.Description as pkgDescription, pkg.Active as pkgActive, pdom.required," +
                "pkg.Repeatable as pkgRepeatable, pkg.QcState as pkgQcState, pkg.Modified as pkgModified, pkg.Created as pkgCreated, " +
                "pkg.ModifiedBy as pkgModifiedBy, pkg.CreatedBy as pkgCreatedBy, " +
                "pd.*, pv.Name as validatorName, pv.TypeURI as validatorTypeURI, pv.Expression as validatorExpression FROM ");
        sql.append(SNDSchema.getInstance().getTableInfoPkgs(), "pkg");
        sql.append(" INNER JOIN ");
        sql.append(OntologyManager.getTinfoDomainDescriptor(), "dd");
        sql.append(" ON dd.DomainURI LIKE CONCAT('%', 'snd', '%', 'Package-', pkg.PkgId) ");
        sql.append(" INNER JOIN ");
        sql.append(OntologyManager.getTinfoPropertyDomain(), "pdom");
        sql.append(" ON pdom.DomainId = dd.DomainId ");
        sql.append(" INNER JOIN ");
        sql.append(OntologyManager.getTinfoPropertyDescriptor(), "pd");
        sql.append(" ON pd.PropertyId = pdom.PropertyId ");
        sql.append(" LEFT JOIN ");
        sql.append(" exp.PropertyValidator pv");
        sql.append(" ON pd.PropertyId = pv.PropertyId ");
        sql.append(") ");
        sql.append(alias);

        return sql;
    }

    @Override
    public boolean hasPermission(@NotNull UserPrincipal user, @NotNull Class<? extends Permission> perm)
    {
        return getContainer().hasPermission(user, SNDViewerPermission.class, getUserSchema().getContextualRoles());
    }

}
