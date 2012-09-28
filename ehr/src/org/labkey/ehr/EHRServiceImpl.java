/*
 * Copyright (c) 2012 LabKey Corporation
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
package org.labkey.ehr;

import org.labkey.api.ehr.EHRService;
import org.labkey.api.module.Module;
import org.labkey.api.resource.Resource;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/14/12
 * Time: 4:46 PM
 */
public class EHRServiceImpl extends EHRService
{
    Set<Module> _registeredModules = new HashSet<Module>();
    List<Resource> _extraTriggerScripts = new ArrayList<Resource>();

    public EHRServiceImpl()
    {

    }

    public void registerModule(Module module)
    {
        _registeredModules.add(module);
    }

    public Set<Module> getRegisteredModules()
    {
        return _registeredModules;
    }

    public void registerTriggerScript(Resource script)
    {
        _extraTriggerScripts.add(script);
    }


    public List<Resource> getExtraTriggerScripts()
    {
        return _extraTriggerScripts;
    }
}
