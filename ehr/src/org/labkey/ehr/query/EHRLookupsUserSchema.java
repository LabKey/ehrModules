/*
 * Copyright (c) 2013-2019 LabKey Corporation
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
package org.labkey.ehr.query;

import org.jetbrains.annotations.Nullable;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.collections.CaseInsensitiveTreeSet;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerFilter;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.SchemaTableInfo;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.security.EHRDataAdminPermission;
import org.labkey.api.ehr.security.EHRHousingTransferPermission;
import org.labkey.api.ehr.security.EHRLocationEditPermission;
import org.labkey.api.ehr.security.EHRProcedureManagementPermission;
import org.labkey.api.ehr.security.EHRSnomedEditPermission;
import org.labkey.api.ldk.table.ContainerScopedTable;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.FilteredTable;
import org.labkey.api.query.QueryForeignKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.SimpleUserSchema;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.Group;
import org.labkey.api.security.MemberType;
import org.labkey.api.security.RoleAssignment;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.ehr.EHRSchema;
import org.labkey.ehr.dataentry.DataEntryManager;
import org.labkey.ehr.security.EHRVeterinarianRole;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * User: bimber
 * Date: 1/31/13
 * Time: 3:50 PM
 */
public class EHRLookupsUserSchema extends SimpleUserSchema
{
    public static final String TABLE_AREAS = "areas";
    public static final String TABLE_BUILDINGS = "buildings";
    public static final String TABLE_CAGE = "cage";
    public static final String TABLE_CAGE_POSITIONS = "cage_positions";
    public static final String TABLE_CAGE_TYPE = "cage_type";
    public static final String TABLE_GEOGRAPHIC_ORIGINS = "geographic_origins";
    public static final String TABLE_ROOMS = "rooms";
    public static final String TABLE_SNOMED = "snomed";
    public static final String TABLE_SNOMED_SUBSET_CODES = "snomed_subset_codes";
    public static final String TABLE_TREATMENT_CODES = "treatment_codes";
    public static final String TABLE_VETERINARIANS = "veterinarians";

    public EHRLookupsUserSchema(User user, Container container, DbSchema dbschema)
    {
        super(EHRSchema.EHR_LOOKUPS, "Predominantly simple and typically small value-lists, such as species or diagnosis codes", user, container, dbschema);
    }

    @Override
    public Set<String> getTableNames()
    {
        Set<String> available = new CaseInsensitiveTreeSet();
        available.addAll(super.getTableNames());

        available.addAll(getPropertySetNames().keySet());
        available.addAll(getLabworkTypeNames().keySet());

        assert !available.contains(TABLE_VETERINARIANS) : "There is a table using the reserved name " + TABLE_VETERINARIANS;
        available.add(TABLE_VETERINARIANS);
        
        return Collections.unmodifiableSet(available);
    }

    @Override
    public Set<String> getVisibleTableNames()
    {
        Set<String> available = new CaseInsensitiveTreeSet();
        available.addAll(super.getVisibleTableNames());

        available.addAll(getPropertySetNames().keySet());
        available.addAll(getLabworkTypeNames().keySet());
        available.add(TABLE_VETERINARIANS);
        
        return Collections.unmodifiableSet(available);
    }

    private Map<String, Map<String, Object>> getPropertySetNames()
    {
        Map<String, Map<String, Object>> nameMap = (Map<String, Map<String, Object>>) DataEntryManager.get().getCache().get(LookupSetTable.getCacheKey(getContainer()));
        if (nameMap != null)
            return nameMap;

        nameMap = new CaseInsensitiveHashMap<>();

        TableSelector ts = new TableSelector(_dbSchema.getTable(EHRSchema.TABLE_LOOKUP_SETS), new SimpleFilter(FieldKey.fromString("container"), getContainer().getId()), null);
        Map<String, Object>[] rows = ts.getMapArray();
        if (rows.length > 0)
        {
            Set<String> existing = super.getTableNames();
            for (Map<String, Object> row : rows)
            {
                String setname = (String)row.get("setname");
                if (setname != null && !existing.contains(setname))
                    nameMap.put(setname, row);
            }
        }

        nameMap = Collections.unmodifiableMap(nameMap);
        DataEntryManager.get().getCache().put(LookupSetTable.getCacheKey(getContainer()), nameMap);

        return nameMap;
    }

    private Map<String, String> getLabworkTypeNames()
    {
        Map<String, String> nameMap = (Map<String, String>) DataEntryManager.get().getCache().get(LabworkTypeTable.CACHE_KEY);
        if (nameMap != null)
            return nameMap;

        nameMap = new CaseInsensitiveHashMap<>();

        TableSelector ts = new TableSelector(_dbSchema.getTable(EHRSchema.TABLE_LABWORK_TYPES), SimpleFilter.createContainerFilter(getContainer()), null);
        Map<String, Object>[] rows = ts.getMapArray();
        if (rows.length > 0)
        {
            Set<String> existing = super.getTableNames();
            for (Map<String, Object> row : rows)
            {
                String tableName = (String)row.get("tableName");
                String type = (String)row.get("type");
                if (tableName != null && !existing.contains(tableName))
                    nameMap.put(tableName, type);
            }
        }

        nameMap = Collections.unmodifiableMap(nameMap);
        DataEntryManager.get().getCache().put(LabworkTypeTable.CACHE_KEY, nameMap);

        return nameMap;
    }

    @Override
    public TableInfo createTable(String name, ContainerFilter cf)
    {
        Set<String> available = super.getTableNames();

        if (TABLE_SNOMED.equalsIgnoreCase(name))
            return getContainerScopedTable(name, cf, "code", EHRSnomedEditPermission.class);
        else if (TABLE_AREAS.equalsIgnoreCase(name))
            return getContainerScopedTable(name, cf, "area", EHRLocationEditPermission.class);
        else if (TABLE_CAGE.equalsIgnoreCase(name))
            return getContainerScopedTable(name, cf, "location", EHRHousingTransferPermission.class);
        else if (TABLE_CAGE_TYPE.equalsIgnoreCase(name))
            return getContainerScopedTable(name, cf, "cagetype", EHRLocationEditPermission.class);
        else if (TABLE_CAGE_POSITIONS.equalsIgnoreCase(name))
            return getContainerScopedTable(name, cf, "cage", EHRLocationEditPermission.class);
        else if (TABLE_ROOMS.equalsIgnoreCase(name))
            return getContainerScopedTable(name, cf, "room", EHRLocationEditPermission.class);
        else if ("procedures".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRProcedureManagementPermission.class);
        else if ("procedure_default_flags".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRProcedureManagementPermission.class);
        else if ("procedure_default_treatments".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRProcedureManagementPermission.class);
        else if ("procedure_default_charges".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRProcedureManagementPermission.class);
        else if ("procedure_default_codes".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRProcedureManagementPermission.class);
        else if ("procedure_default_comments".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRProcedureManagementPermission.class);
        else if (TABLE_SNOMED_SUBSET_CODES.equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRSnomedEditPermission.class);
        else if ("drug_defaults".equalsIgnoreCase(name))
            return getCustomPermissionTable(createSourceTable(name), cf, EHRSnomedEditPermission.class);
        else if (TABLE_VETERINARIANS.equalsIgnoreCase(name))
            return createVeterinariansTable(name, cf);
        else if (EHRSchema.TABLE_LOOKUP_SETS.equalsIgnoreCase(name))
        {
            ContainerScopedTable<SimpleUserSchema> ret = new LookupSetsTable<>(this, createSourceTable(name), cf, "setname");
            ret.addPermissionMapping(InsertPermission.class, EHRDataAdminPermission.class);
            ret.addPermissionMapping(UpdatePermission.class, EHRDataAdminPermission.class);
            ret.addPermissionMapping(DeletePermission.class, EHRDataAdminPermission.class);
            return ret.init();
        }

        if (available.contains(name))
        {
            TableInfo ti = super.createTable(name, cf);

            // By default, any hard tables in the ehr_lookups schema not accounted for above will fall into one of the
            // two categories below. Both of these will add a check that makes sure the user has EHRDataAdminPermission
            // in order to insert/update/delete on the table. The ContainerScopedTable case is for those tables that
            // have a true DB PK or rowid but a User psedoPK that should be accounted for at the container level.
            String pkColName = getPkColName(ti);
            if (pkColName != null && !"rowid".equalsIgnoreCase(pkColName) && ti.getColumn("container") != null)
                return getContainerScopedTable(name, cf, pkColName, EHRDataAdminPermission.class);
            else
                return getCustomPermissionTable(createSourceTable(name), cf, EHRDataAdminPermission.class);
        }

        //try to find it in propertySets
        Map<String, Map<String, Object>> nameMap = getPropertySetNames();
        if (nameMap.containsKey(name))
            return createForPropertySet(this, cf, name, nameMap.get(name));

        Map<String, String> labworkMap = getLabworkTypeNames();
        if (labworkMap.containsKey(name))
            return createForLabwork(this, cf, name, labworkMap.get(name));

        return null;
    }

    private String getPkColName(TableInfo ti)
    {
        if (ti != null)
        {
            List<String> pkCols = ti.getPkColumnNames();
            if (pkCols.size() == 1)
                return pkCols.get(0);
        }

        return null;
    }

    private TableInfo createVeterinariansTable(String name, ContainerFilter cf)
    {
        FilteredTable ti = new FilteredTable<>(CoreSchema.getInstance().getTableInfoUsersData(), this, cf);
        ti.setPublicSchemaName(EHRSchema.EHR_LOOKUPS);

        Set<Integer> userIds = new HashSet<>();
        Set<Group> groupsToExpand = new HashSet<>();

        SecurityPolicy policy = getContainer().getPolicy();
        for (RoleAssignment r : policy.getAssignments())
        {
            if (r.getRole().getClass() == EHRVeterinarianRole.class)
            {
                User user = UserManager.getUser(r.getUserId());
                if (user != null)
                {
                    userIds.add(user.getUserId());
                }
                else
                {
                    Group assignedGroup = SecurityManager.getGroup(r.getUserId());
                    if (assignedGroup != null && !assignedGroup.isProjectGroup())
                    {
                        // Add all site groups
                        groupsToExpand.add(assignedGroup);
                    }
                }
            }
        }

        for (Group group : groupsToExpand)
        {
            Set<User> groupMembers = SecurityManager.getAllGroupMembers(group, MemberType.ACTIVE_USERS);
            for (User groupMember : groupMembers)
            {
                userIds.add(groupMember.getUserId());
            }
        }

        ti.addCondition(new SimpleFilter(FieldKey.fromString("UserId"), userIds, CompareType.IN));

        ti.addWrapColumn(ti.getRealTable().getColumn("UserId"));
        ti.addWrapColumn(ti.getRealTable().getColumn("DisplayName"));
        ti.getMutableColumn("UserId").setFk(new QueryForeignKey(QueryService.get().getUserSchema(getUser(), getContainer(), "core"), null, "Users", "UserId", "DisplayName"));
        ti.setName(name);
        ti.setTitle("Veterinarians");

        return ti;
    }

    private TableInfo getContainerScopedTable(String name, ContainerFilter cf, String psuedoPk, @Nullable Class<? extends Permission> perm)
    {
        EHR_LookupsContainerScopedTable ret = new EHR_LookupsContainerScopedTable<>(this, this.createSourceTable(name), cf, psuedoPk);
        if (perm != null)
        {
            ret.addPermissionMapping(InsertPermission.class, perm);
            ret.addPermissionMapping(UpdatePermission.class, perm);
            ret.addPermissionMapping(DeletePermission.class, perm);
        }
        return ret.init();
    }

    private TableInfo getCustomPermissionTable(TableInfo schemaTable, ContainerFilter cf, Class<? extends Permission> perm)
    {
        EHR_LookupsCustomPermissionsTable ret = new EHR_LookupsCustomPermissionsTable<>(this, schemaTable, cf);
        ret.addPermissionMapping(InsertPermission.class, perm);
        ret.addPermissionMapping(UpdatePermission.class, perm);
        ret.addPermissionMapping(DeletePermission.class, perm);
        return ret.init();
    }

    private LookupSetTable createForPropertySet(UserSchema us, ContainerFilter cf, String setName, Map<String, Object> map)
    {
        SchemaTableInfo table = _dbSchema.getTable(EHRSchema.TABLE_LOOKUPS);
        LookupSetTable ret = new LookupSetTable(us, table, cf, setName, map);
        ret.addPermissionMapping(InsertPermission.class, EHRDataAdminPermission.class);
        ret.addPermissionMapping(UpdatePermission.class, EHRDataAdminPermission.class);
        ret.addPermissionMapping(DeletePermission.class, EHRDataAdminPermission.class);
        return ret.init();
    }

    private LabworkTypeTable createForLabwork(UserSchema us, ContainerFilter cf, String tableName, String typeName)
    {
        SchemaTableInfo table = _dbSchema.getTable(EHRSchema.TABLE_LAB_TESTS);
        return new LabworkTypeTable(us, table, cf, tableName, typeName).init();
    }
}
