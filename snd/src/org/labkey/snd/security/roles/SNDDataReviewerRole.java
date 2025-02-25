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
package org.labkey.snd.security.roles;

import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.SecurableResource;
import org.labkey.api.security.SecurityPolicy;
import org.labkey.api.security.roles.AbstractModuleScopedRole;
import org.labkey.api.snd.Category;
import org.labkey.snd.SNDModule;
import org.labkey.snd.security.permissions.SNDCompletedReadPermission;
import org.labkey.snd.security.permissions.SNDCompletedUpdatePermission;
import org.labkey.snd.security.permissions.SNDInProgressReadPermission;
import org.labkey.snd.security.permissions.SNDRejectedReadPermission;
import org.labkey.snd.security.permissions.SNDRejectedUpdatePermission;
import org.labkey.snd.security.permissions.SNDReviewRequiredReadPermission;
import org.labkey.snd.security.permissions.SNDReviewRequiredUpdatePermission;

public class SNDDataReviewerRole extends AbstractModuleScopedRole
{
    public SNDDataReviewerRole()
    {
        super("SND Data Reviewer", "SND Data Reviewer may read and update SND data with QC states In Progress, Review Requested and Completed.",
                SNDModule.class,
                SNDInProgressReadPermission.class,
                SNDReviewRequiredReadPermission.class, SNDReviewRequiredUpdatePermission.class,
                SNDCompletedReadPermission.class, SNDCompletedUpdatePermission.class,
                SNDRejectedReadPermission.class, SNDRejectedUpdatePermission.class);
    }

    @Override
    public boolean isApplicable(SecurityPolicy policy, SecurableResource resource)
    {
        return resource instanceof Category && ((Category)resource).getContainer().getActiveModules().contains(ModuleLoader.getInstance().getModule(SNDModule.class));
    }
}