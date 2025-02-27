/*
 * Copyright (c) 2018 LabKey Corporation
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
package org.labkey.snd.security;


import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.CoreSchema;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.Group;
import org.labkey.api.security.MutableSecurityPolicy;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.impersonation.ImpersonationContext;
import org.labkey.api.security.impersonation.RoleImpersonationContextFactory;
import org.labkey.api.security.permissions.Permission;
import org.labkey.api.security.roles.Role;
import org.labkey.api.snd.Category;
import org.labkey.api.snd.Event;
import org.labkey.api.snd.QCStateEnum;
import org.labkey.api.snd.SNDService;
import org.labkey.api.snd.SuperPackage;
import org.labkey.api.view.NotFoundException;
import org.labkey.snd.SNDManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class SNDSecurityManager
{
    private static final SNDSecurityManager _instance = new SNDSecurityManager();

    public static SNDSecurityManager get()
    {
        return _instance;
    }

    public void updatePermission(Container c, User u, int categoryId, String groupName, String roleName)
    {
        List<Integer> categoryIds = new ArrayList<>();
        categoryIds.add(categoryId);

        List<Category> categories = SNDManager.get().getCategories(c, u, categoryIds);
        Category category;
        if (categories != null && !categories.isEmpty())
        {
            category = categories.get(0);
            Group group = SecurityManager.getGroup(SecurityManager.getGroupId(c, groupName));
            if (group != null)
            {
                MutableSecurityPolicy policy;

                SecurityPolicy existingPolicy = SecurityPolicyManager.getPolicy(c, category.getResourceId());
                if (existingPolicy != null)
                {
                    policy = new MutableSecurityPolicy(existingPolicy);
                }
                else
                {
                    policy = new MutableSecurityPolicy(category);
                }

                Role role = getRoleByName(roleName);
                if (role == null && !roleName.equals("None"))
                {
                    throw new NotFoundException("Role not found.");
                }

                // Clear role first
                policy.clearAssignedRoles(group);

                if (role != null)
                {
                    policy.addRoleAssignment(group, role);
                }

                SecurityPolicyManager.savePolicy(policy, u);
            }
            else
            {
                throw new NotFoundException("Group not found.");
            }
        }
        else
        {
            throw new NotFoundException("Category not found.");
        }
    }

    public void updatePermissions(Container c, User u, Map props)
    {
        String groupCat;
        String[] parts;

        Map<Integer, Category> categories = SNDService.get().getAllCategories(c, u);
        Category category;

        SecurityManager.getGroups(c.getProject(), true);

        Map<Integer, MutableSecurityPolicy> policyMap = new HashMap<>();  // Policy cache
        MutableSecurityPolicy policy;
        Group group;
        Role role;
        SecurityPolicy existingPolicy;
        String roleName;

        for (Object key : props.keySet())
        {
            // parse incoming string
            parts = ((String) key).split("\\|");

            if (parts.length < 2)
                continue;

            groupCat = parts[1];
            parts = groupCat.split("_");

            if (parts.length < 2)
                continue;

            // get/create policy
            category = categories.get(Integer.parseInt(parts[1]));
            policy = policyMap.get(category.getCategoryId());
            if (policy == null)
            {
                existingPolicy = SecurityPolicyManager.getPolicy(c, category.getResourceId());
                if (existingPolicy != null)
                {
                    policy = new MutableSecurityPolicy(existingPolicy);
                }
            }

            if (policy == null)
            {
                policy = new MutableSecurityPolicy(category);
            }

            // add policy role
            group = SecurityManager.getGroup(Integer.parseInt(parts[0]));
            if (group != null)
            {
                roleName = (String) props.get(key);
                role = getRoleByName(roleName);

                // Clear role first
                if (role != null || roleName.equals("None"))
                {
                    policy.clearAssignedRoles(group);
                }

                if (role != null)
                {
                    policy.addRoleAssignment(group, role);
                }

                policyMap.put(category.getCategoryId(), policy);
            }
        }

        // save all policies
        for (MutableSecurityPolicy savedPolicy : policyMap.values())
        {
            SecurityPolicyManager.savePolicy(savedPolicy, u);
        }
    }

    private Role getRoleByName(String name)
    {
        return EnumSet.allOf(SecurityRolesEnum.class).stream().map(SecurityRolesEnum::getRole).filter(role -> role.getName().equals(name)).findFirst().orElse(null);
    }

    public Map<String, Role> getAllSecurityRoles()
    {
        return EnumSet.allOf(SecurityRolesEnum.class).stream().map(SecurityRolesEnum::getRole).collect(Collectors.toMap(
                Role::getName, role -> role));
    }

    private boolean hasPermission(User u, Category category, QCStateActionEnum action, QCStateEnum qcState)
    {
        Permission perm = action.getPermission(qcState);
        if (perm == null)
        {
            return false;
        }

        Set<Role> roles = Set.of();

        // SND has permissions bound to SND categories which can be assigned to packages (domains). Impersonating roles is used
        // in automated and manual testing to verify this behavior. The behavior of role impersonation was changed in core
        // labkey to only check for roles related to containers. This is a workaround to go back to checking all roles.
        ImpersonationContext impersonationContext = u.getImpersonationContext();
        if (impersonationContext instanceof RoleImpersonationContextFactory.RoleImpersonationContext context)
        {
            roles = context.getRoles().getRoles();
        }

        return SecurityManager.hasAllPermissions(this.getClass().getName() + ":" + category.getResourceName(),
                category, u, Set.of(perm.getClass()), roles);

    }

    public boolean hasPermissionForCategories(User u, List<Category> categories, QCStateActionEnum action, QCStateEnum qcState)
    {
        boolean permission = false;

        if (categories != null && action != null && qcState != null)
        {
            for (Category category : categories)
            {
                if (hasPermission(u, category, action, qcState))
                {
                    permission = true;
                    break;
                }
            }
        }

        return permission;
    }

    public boolean hasPermissionForTopLevelSuperPkgs(Container c, User u, Map<Integer, SuperPackage> superPackages, Event event, QCStateActionEnum action)
    {
        if (event == null)
        {
            return false;
        }

        if (superPackages == null || superPackages.isEmpty())
        {
            // Event with no super packages will have no categories
            return true;
        }

        if (action == null)
        {
            event.setException(new ValidationException("Missing action type for security check."));
            return false;
        }

        if (event.getQcState() == null)
        {
            event.setException(new ValidationException("Missing QC state for security check."));
            return false;
        }

        boolean hasPermission = true;
        boolean hasSuperPkgPermission;
        List<Integer> categoryIds;
        List<Category> categories;
        for (SuperPackage superPackage : superPackages.values())
        {
            hasSuperPkgPermission = false;
            categoryIds = new ArrayList<>();
            if (superPackage.getPkg() != null)
            {
                categoryIds.addAll(superPackage.getPkg().getCategories().keySet());
                if (categoryIds.isEmpty())
                {
                    hasSuperPkgPermission = false;
                }
                else
                {
                    categories = SNDManager.get().getCategories(c, u, categoryIds);
                    hasSuperPkgPermission = hasPermissionForCategories(u, categories, action, event.getQcState(c, u));
                }
            }

            if (!hasSuperPkgPermission)
            {
                hasPermission = false;
                break;
            }
        }

        if (!hasPermission)
        {
            QCStateEnum qcState = event.getQcState(c, u);
            event.setException(new ValidationException("You do not have permission to " + action.getName() + " event data for QC state "
                    + (qcState != null ? qcState.getName() : "Undefined") + " for these super packages.", ValidationException.SEVERITY.ERROR));
        }
        return hasPermission;
    }

    public Integer getQCStateId(Container c, User u, QCStateEnum qcState)
    {
        TableInfo qcStateTable = CoreSchema.getInstance().getTableInfoDataStates();

        SimpleFilter qcFilter = SimpleFilter.createContainerFilter(c).addCondition(FieldKey.fromParts("Label"), qcState.getName(), CompareType.EQUAL);

        // Get from eventNotes table
        Set<String> cols = Collections.singleton("RowId");
        TableSelector qcStateTs = new TableSelector(qcStateTable, cols, qcFilter, null);

        return qcStateTs.getObject(Integer.class);
    }

    public QCStateEnum getQCState(Container c, User u, int qcStateId)
    {
        TableInfo qcStateTable = CoreSchema.getInstance().getTableInfoDataStates();

        SimpleFilter qcFilter = SimpleFilter.createContainerFilter(c).addCondition(FieldKey.fromParts("RowId"), qcStateId, CompareType.EQUAL);

        // Get from eventNotes table
        Set<String> cols = Collections.singleton("Label");
        TableSelector qcStateTs = new TableSelector(qcStateTable, cols, qcFilter, null);

        String qcStateName = qcStateTs.getObject(String.class);

        return QCStateEnum.getByName(qcStateName);
    }

    public void populateQCStates(Container c, User u)
    {
        UserSchema coreSchema = QueryService.get().getUserSchema(u, c, "core");
        TableInfo qcStateTi = CoreSchema.getInstance().getTableInfoDataStates();

        Object[][] states = EnumSet.allOf(QCStateEnum.class).stream().map(qcStateEnum -> new Object[]{qcStateEnum.getName(), qcStateEnum.getDescription(), qcStateEnum.isPublicData()}).toArray(Object[][]::new);

        try (DbScope.Transaction transaction = coreSchema.getDbSchema().getScope().ensureTransaction())
        {
            // check if QCStates exist, if not insert them
            for (Object[] qc : states)
            {
                SimpleFilter filter = SimpleFilter.createContainerFilter(c);
                filter.addCondition(FieldKey.fromString("Label"), qc[0]);

                TableSelector ts = new TableSelector(qcStateTi, Collections.singleton("RowId"), filter, null);
                Integer[] rowIds = ts.getArray(Integer.class);

                Map<String, Object> row = new CaseInsensitiveHashMap<>();
                row.put("Container", c.getId());
                row.put("Label", qc[0]);
                row.put("Description", qc[1]);
                row.put("PublicData", qc[2]);

                if (rowIds.length < 1)
                {
                    Table.insert(u, qcStateTi, row);

                }
                else
                {
                    Table.update(u, qcStateTi, row, rowIds);
                }
            }

            transaction.commit();
        }
    }

}
