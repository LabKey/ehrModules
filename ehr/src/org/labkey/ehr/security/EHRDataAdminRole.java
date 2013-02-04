/*
 * Copyright (c) 2011-2013 LabKey Corporation
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
package org.labkey.ehr.security;

import org.labkey.api.data.Container;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.Group;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.permissions.DeletePermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.study.DataSet;
import org.labkey.ehr.EHRModule;

/**
 * User: jeckels
 * Date: Feb 25, 2011
 */
public class EHRDataAdminRole extends AbstractEHRDatasetRole
{
    public EHRDataAdminRole()
    {
        super("EHR Data Admin", "Users with this role are permitted to make any edits to datasets",
//                AdminPermission.class,
                ReadPermission.class,
                InsertPermission.class,
                UpdatePermission.class,
                DeletePermission.class,

                EHRAbnormalAdminPermission.class,
                EHRAbnormalDeletePermission.class,
                EHRAbnormalInsertPermission.class,
                EHRAbnormalUpdatePermission.class,
                EHRCompletedAdminPermission.class,
                EHRCompletedDeletePermission.class,
                EHRCompletedInsertPermission.class,
                EHRCompletedUpdatePermission.class,
                EHRDeleteRequestedAdminPermission.class,
                EHRDeleteRequestedDeletePermission.class,
                EHRDeleteRequestedInsertPermission.class,
                EHRDeleteRequestedUpdatePermission.class,
                EHRInProgressAdminPermission.class,
                EHRInProgressDeletePermission.class,
                EHRInProgressInsertPermission.class,
                EHRInProgressUpdatePermission.class,
                EHRRequestApprovedAdminPermission.class,
                EHRRequestApprovedDeletePermission.class,
                EHRRequestApprovedInsertPermission.class,
                EHRRequestApprovedUpdatePermission.class,
                EHRRequestApprovedDeletePermission.class,
                EHRRequestCompleteAdminPermission.class,
                EHRRequestCompleteDeletePermission.class,
                EHRRequestCompleteInsertPermission.class,
                EHRRequestCompleteUpdatePermission.class,
                EHRRequestDeniedAdminPermission.class,
                EHRRequestDeniedDeletePermission.class,
                EHRRequestDeniedInsertPermission.class,
                EHRRequestDeniedUpdatePermission.class,
                EHRRequestPendingAdminPermission.class,
                EHRRequestPendingDeletePermission.class,
                EHRRequestPendingInsertPermission.class,
                EHRRequestPendingUpdatePermission.class,
                EHRReviewRequiredAdminPermission.class,
                EHRReviewRequiredDeletePermission.class,
                EHRReviewRequiredInsertPermission.class,
                EHRReviewRequiredUpdatePermission.class,
                EHRScheduledAdminPermission.class,
                EHRScheduledDeletePermission.class,
                EHRScheduledInsertPermission.class,
                EHRScheduledUpdatePermission.class

        );

        addExcludedPrincipal(org.labkey.api.security.SecurityManager.getGroup(Group.groupGuests));
    }

    @Override
    public boolean isApplicable(SecurityPolicy policy, SecurableResource resource)
    {
        if (resource instanceof Container)
            return ((Container)resource).getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class));
        else if (resource instanceof DataSet)
            return ((DataSet)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(EHRModule.class));

        return false;
    }
}
