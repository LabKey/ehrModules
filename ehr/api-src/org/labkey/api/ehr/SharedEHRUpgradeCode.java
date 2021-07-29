package org.labkey.api.ehr;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.di.DataIntegrationService;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.security.User;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.ContextListener;
import org.labkey.api.util.Path;
import org.labkey.api.util.StartupListener;
import org.labkey.api.util.UnexpectedException;

import javax.servlet.ServletContext;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Allows upgrade scripts to prescribe study reloads and ETL executions (including truncates). Will look at the
 * site-wide ehrStudyContainer and ehrAdminUser module properties to decide where and as whom to run the jobs.
 *
 * Supports 'reloadStudy' or 'etl;%TRANSFORM_ID%' with an optional ';truncate' suffix
 */
public class SharedEHRUpgradeCode implements UpgradeCode, StartupListener
{
    private static final Logger LOG = LogManager.getLogger(SharedEHRUpgradeCode.class);
    private final Module _module;

    private static final String ETL_PREFIX = "etl;";

    private boolean _reloadStudy;
    /** ETL name -> whether to truncate before running */
    private final Map<String, Boolean> _etls = new LinkedHashMap<>();

    public SharedEHRUpgradeCode(Module module)
    {
        _module = module;
        // After startup has completed and pipelines and ETLs have been registered, kick off the work that was
        // requested as part of this upgrade sequence
        ContextListener.addStartupListener(this);
    }

    @SuppressWarnings("unused")
    public void reloadStudy(ModuleContext context)
    {
        _reloadStudy = true;
    }

    @Override
    public void fallthroughHandler(String methodName)
    {
        if (methodName.startsWith(ETL_PREFIX))
        {
            String[] etlArguments = methodName.split(";");
            String etlName = etlArguments[1];
            boolean truncate = false;
            if (etlArguments.length > 2)
            {
                if (etlArguments.length > 3)
                {
                    throw new UnsupportedOperationException("Unsupported ETL arguments: " + methodName);
                }
                if (!"truncate".equals(etlArguments[2]))
                {
                    throw new UnsupportedOperationException("Unsupported ETL arguments: " + methodName);
                }
                truncate = true;
            }
            if (_etls.containsKey(etlName))
            {
                truncate = truncate || _etls.get(etlName).booleanValue();
            }
            _etls.put(etlName, truncate);
        }
        else
        {
            UpgradeCode.super.fallthroughHandler(methodName);
        }
    }

    @Override
    public String getName()
    {
        return _module.getName() + " startup listener";
    }

    @Override
    public void moduleStartupComplete(ServletContext servletContext)
    {
        if (_reloadStudy || !_etls.isEmpty())
        {
            Container container = EHRService.get().getEHRStudyContainer(ContainerManager.getRoot());
            if (container == null)
            {
                LOG.warn("No EHR study container. Unable to perform upgrade steps for " + _module.getName());
                return;
            }
            User user = EHRService.get().getEHRUser(ContainerManager.getRoot());
            if (user == null || !user.isActive())
            {
                LOG.warn("No EHR admin user. Unable to perform upgrade steps for " + _module.getName());
                return;
            }

            if (_reloadStudy)
            {
                try
                {
                    EHRService.get().importStudyDefinition(container, user, _module, new Path("referenceStudy"));
                }
                catch (IOException e)
                {
                    throw UnexpectedException.wrap(e);
                }
            }

            for (Map.Entry<String, Boolean> etlInfo : _etls.entrySet())
            {
                if (etlInfo.getValue().booleanValue())
                {
                    DataIntegrationService.get().truncateTargets(container, user, etlInfo.getKey());
                }
                try
                {
                    DataIntegrationService.get().runTransformNow(container, user, etlInfo.getKey());
                }
                catch(PipelineJobException | ConfigurationException e)
                {
                    LOG.error("Failed to launch ETL " + etlInfo.getKey(), e);
                }
            }
        }
    }
}
