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

import org.jetbrains.annotations.Nullable;
import org.labkey.api.snd.QCStateEnum;
import org.labkey.snd.security.permissions.SNDCompletedDeletePermission;
import org.labkey.snd.security.permissions.SNDCompletedInsertPermission;
import org.labkey.snd.security.permissions.SNDCompletedReadPermission;
import org.labkey.snd.security.permissions.SNDCompletedUpdatePermission;
import org.labkey.snd.security.permissions.SNDInProgressDeletePermission;
import org.labkey.snd.security.permissions.SNDInProgressInsertPermission;
import org.labkey.snd.security.permissions.SNDInProgressReadPermission;
import org.labkey.snd.security.permissions.SNDInProgressUpdatePermission;
import org.labkey.snd.security.permissions.SNDQCStatePermission;
import org.labkey.snd.security.permissions.SNDRejectedDeletePermission;
import org.labkey.snd.security.permissions.SNDRejectedInsertPermission;
import org.labkey.snd.security.permissions.SNDRejectedReadPermission;
import org.labkey.snd.security.permissions.SNDRejectedUpdatePermission;
import org.labkey.snd.security.permissions.SNDReviewRequiredDeletePermission;
import org.labkey.snd.security.permissions.SNDReviewRequiredInsertPermission;
import org.labkey.snd.security.permissions.SNDReviewRequiredReadPermission;
import org.labkey.snd.security.permissions.SNDReviewRequiredUpdatePermission;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public enum QCStateActionEnum
{
    INSERT("Insert", new SNDCompletedInsertPermission(), new SNDInProgressInsertPermission(), new SNDRejectedInsertPermission(), new SNDReviewRequiredInsertPermission()),
    UPDATE("Update", new SNDCompletedUpdatePermission(), new SNDInProgressUpdatePermission(), new SNDRejectedUpdatePermission(), new SNDReviewRequiredUpdatePermission()),
    DELETE("Delete", new SNDCompletedDeletePermission(), new SNDInProgressDeletePermission(), new SNDRejectedDeletePermission(), new SNDReviewRequiredDeletePermission()),
    READ("Read", new SNDCompletedReadPermission(), new SNDInProgressReadPermission(), new SNDRejectedReadPermission(), new SNDReviewRequiredReadPermission());

    private List<SNDQCStatePermission> _permissions = new ArrayList<>();
    private String _name;

    QCStateActionEnum(String name, SNDQCStatePermission... perms)
    {
        _permissions.addAll(Arrays.asList(perms));
        _name = name;
    }

    @Nullable
    public SNDQCStatePermission getPermission(QCStateEnum qcState)
    {
        for (SNDQCStatePermission permission : _permissions)
        {
            if (permission.getQCState() == qcState)
            {
                return permission;
            }
        }

        return null;
    }

    public String getName()
    {
        return _name;
    }
}
