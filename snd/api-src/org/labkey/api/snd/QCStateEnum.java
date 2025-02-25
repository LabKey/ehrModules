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
package org.labkey.api.snd;

import org.jetbrains.annotations.Nullable;

public enum QCStateEnum
{
    COMPLETED("Completed", "Record has been completed and is public", true),
    REJECTED("Rejected", "Record has been reviewed and rejected", false),
    REVIEW_REQUIRED("Review Required", "Review is required prior to public release", false),
    IN_PROGRESS("In Progress", "Draft Record, not public", false);

    private String _name;
    private String _description;
    private boolean _publicData;

    QCStateEnum(String name, String description, boolean publicData)
    {
        _name = name;
        _description = description;
        _publicData = publicData;
    }

    public String getName()
    {
        return _name;
    }

    public void setName(String name)
    {
        _name = name;
    }

    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public boolean isPublicData()
    {
        return _publicData;
    }

    public void setPublicData(boolean publicData)
    {
        _publicData = publicData;
    }

    @Nullable
    public static QCStateEnum getByName(String name)
    {
        for (QCStateEnum qcStateEnum : QCStateEnum.values())
        {
            if (qcStateEnum.getName().equals(name))
            {
                return qcStateEnum;
            }
        }

        return null;
    }
}
