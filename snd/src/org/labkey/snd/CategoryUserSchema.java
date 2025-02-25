package org.labkey.snd;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashSet;
import org.labkey.api.collections.CaseInsensitiveTreeSet;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.TableInfo;
import org.labkey.api.query.QuerySchema;
import org.labkey.api.query.SchemaKey;
import org.labkey.api.query.UserSchema;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class CategoryUserSchema extends UserSchema
{
    public static final String SCHEMA_NAME = "Categories";

    final SNDUserSchema _sndSchema;
    final QuerySchema _packageSchema;

    public CategoryUserSchema(SNDUserSchema parent)
    {
        super(new SchemaKey(parent.getSchemaPath(), SCHEMA_NAME), null, parent.getUser(), parent.getContainer(), parent.getDbSchema(), null);
        _sndSchema = parent;
        _packageSchema = _sndSchema.getSchema(PackageUserSchema.SCHEMA_NAME);
    }

    @Override
    public Set<String> getSchemaNames()
    {
        return Set.of();
    }

    @Override
    public Set<String> getTableNames()
    {
        var sql = new SQLFragment("SELECT Description FROM snd.PkgCategories WHERE Active=1 AND Container=").appendValue(getContainer());
        List<String> list = new SqlSelector(getDbSchema(), sql).getArrayList(String.class);

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
        var sql = new SQLFragment("SELECT CategoryId, Description FROM snd.PkgCategories WHERE Active=1 AND Container=").appendValue(getContainer())
                .append(" AND lower(description) = lower(").appendValue(name).append(")");
        Map<String,Object>[] rs = new SqlSelector(getDbSchema(), sql).getMapArray();
        if (rs.length != 1)
            return null;
        int categoryId = (Integer)rs[0].get("CategoryId");
        name = (String)rs[0].get("Description");

        PackageUserSchema packageUserSchema = (PackageUserSchema)_sndSchema.getUserSchema(PackageUserSchema.SCHEMA_NAME);
        if (null == packageUserSchema)
            return null;

        /* NOTE createCategoryTable() is implemented by PackageUserSchema for implementation sharing.
         * I suppose you could argue since we're casting anyway that we could just make the required/shared
         * methods public, but this works.
         */
        return packageUserSchema.createCategoryTable(this, categoryId, name);
    }
}
