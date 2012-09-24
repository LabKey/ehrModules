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
