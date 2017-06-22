/*
 * Copyright (c) 2016-2017 LabKey Corporation
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
package org.labkey.api.ehr;

import org.labkey.api.data.Container;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.security.User;

/**
 * Base class for EHR resources that are owned by and enabled/disabled based on which modules are enabled
 * in the current folder.
 */
public abstract class EHROwnable
{
    protected Module _owner = null;

    public EHROwnable(Module owner)
    {
        _owner = owner;
    }

    public boolean isAvailable(Container c,User u)
    {
        if (_owner != null && !c.getActiveModules().contains(_owner))
            return false;

        return c.getActiveModules(u).contains(ModuleLoader.getInstance().getModule("ehr"));
    }
}
