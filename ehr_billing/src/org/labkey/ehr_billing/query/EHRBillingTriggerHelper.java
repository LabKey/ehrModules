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
package org.labkey.ehr_billing.query;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.security.EHRDataAdminPermission;
import org.labkey.api.ehr_billing.security.EHR_BillingAdminPermission;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.ehr_billing.EHR_BillingManager;
import org.labkey.ehr_billing.EHR_BillingSchema;

import java.util.HashMap;
import java.util.Map;

/**
 * Helper class for EHR Billing trigger scripts. Referenced from JavaScript files to make it easier to do certain
 * kind of validation work than it would be directly in the JS code.
 */
public class EHRBillingTriggerHelper
{
    private Container _container;
    private User _user;
    private Map<Integer, Map<String, Object>> _cachedCharges = new HashMap<>();

    public EHRBillingTriggerHelper(int userId, String containerId)
    {
        _user = UserManager.getUser(userId);
        if (_user == null)
            throw new RuntimeException("User does not exist: " + userId);

        _container = ContainerManager.getForId(containerId);
        if (_container == null)
            throw new RuntimeException("Container does not exist: " + containerId);

    }

    public boolean supportsCustomUnitCost(int chargeId)
    {
        Map<String, Object> row = getCharge(chargeId);
        if (row != null && row.containsKey("allowscustomunitcost") && row.get("allowscustomunitcost") != null)
        {
            return (boolean)row.get("allowscustomunitcost");
        }

        return false; //unknown charge, assume false
    }

    public boolean supportsBlankAnimal(int chargeId)
    {
        Map<String, Object> row = getCharge(chargeId);
        if (row != null && row.containsKey("allowblankid") && row.get("allowblankid") != null)
        {
            return (boolean)row.get("allowblankid");
        }

        return false; //unknown charge, assume false
    }

    private Map<String, Object> getCharge(Integer chargeId)
    {
        if (_cachedCharges.containsKey(chargeId))
        {
            return _cachedCharges.get(chargeId);
        }

        Container target = EHR_BillingManager.get().getBillingContainer(getContainer());
        if (target != null)
        {
            TableInfo chargeableItems = DbSchema.get(EHR_BillingSchema.NAME, DbSchemaType.Module).getTable(EHR_BillingSchema.TABLE_CHARGEABLE_ITEMS);
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("rowid"), chargeId, CompareType.EQUAL);
            filter.addCondition(FieldKey.fromString("container"), target.getId(), CompareType.EQUAL);
            TableSelector ts = new TableSelector(chargeableItems, PageFlowUtil.set("rowid", "name", "allowscustomunitcost", "allowblankid", "active"), filter, null);
            Map<String, Object>[] ret = ts.getMapArray();
            if (ret.length == 1)
            {
                _cachedCharges.put(chargeId, ret[0]);
            }
        }

        return _cachedCharges.get(chargeId);
    }


    private User getUser()
    {
        return _user;
    }

    private Container getContainer()
    {
        return _container;
    }

    public boolean isBillingAdmin()
    {
        return getContainer().hasPermission(getUser(), EHR_BillingAdminPermission.class);
    }

    public boolean isDataAdmin()
    {
        return getContainer().hasPermission(getUser(), EHRDataAdminPermission.class);
    }
}

