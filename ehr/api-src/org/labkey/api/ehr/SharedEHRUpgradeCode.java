package org.labkey.api.ehr;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.Logger;
import org.labkey.api.audit.TransactionAuditProvider;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.di.DataIntegrationService;
import org.labkey.api.exp.property.DomainTemplateGroup;
import org.labkey.api.gwt.client.AuditBehaviorType;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.pipeline.PipelineJobException;
import org.labkey.api.query.AbstractQueryImportAction;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.UserSchema;
import org.labkey.api.reader.DataLoader;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.User;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.ContextListener;
import org.labkey.api.util.Pair;
import org.labkey.api.util.Path;
import org.labkey.api.util.StartupListener;
import org.labkey.api.util.UnexpectedException;
import org.labkey.api.util.logging.LogHelper;
import org.labkey.api.view.NotFoundException;

import javax.servlet.ServletContext;
import java.io.IOException;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import static org.labkey.api.query.AbstractQueryUpdateService.createTransactionAuditEvent;

/**
 * Allows upgrade scripts to prescribe folder reloads and ETL executions (including truncates). Will look at the
 * site-wide ehrStudyContainer and ehrAdminUser module properties to decide where and as whom to run the jobs.
 *
 * Supports 'reloadFolder' or 'etl;%TRANSFORM_ID%' with an optional ';truncate' suffix
 */
public class SharedEHRUpgradeCode implements UpgradeCode, StartupListener
{
    private static final Logger LOG = LogHelper.getLogger(SharedEHRUpgradeCode.class, "Automated imports for EHR data changes");
    private final Module _module;

    private static final String ETL_PREFIX = "etl;";
    private static final String IMPORT_FROM_TSV_PREFIX = "importFromTsv;";
    private static final String IMPORT_DOMAIN_TEMPLATE = "importTemplate;";

    private boolean _reloadFolder;
    /** ETL name -> whether to truncate before running */
    private final Map<String, Boolean> _etls = new LinkedHashMap<>();
    private final Set<TsvImport> _tsvImports = new LinkedHashSet<>();

    private static final Map<Module, SharedEHRUpgradeCode> _instances = new HashMap<>();

    public static SharedEHRUpgradeCode getInstance(Module module)
    {
        return _instances.computeIfAbsent(module, SharedEHRUpgradeCode::new);
    }

    private SharedEHRUpgradeCode(Module module)
    {
        _module = module;
        // After startup has completed and pipelines and ETLs have been registered, kick off the work that was
        // requested as part of this upgrade sequence
        ContextListener.addStartupListener(this);
    }

    @SuppressWarnings("unused")
    public void reloadFolder(ModuleContext context)
    {
        _reloadFolder = true;
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
        else if (methodName.startsWith(IMPORT_FROM_TSV_PREFIX))
        {
            String[] tsvArguments = methodName.split(";");
            if (tsvArguments.length != 4)
            {
                throw new UnsupportedOperationException("Expected three arguments for importFromTsv but got " + (tsvArguments.length - 1));
            }
            String schemaName = tsvArguments[1];
            String queryName = tsvArguments[2];
            String tsvPath = tsvArguments[3];

            _tsvImports.add(new TsvImport(schemaName, queryName, tsvPath));
        }
        else if (methodName.startsWith(IMPORT_DOMAIN_TEMPLATE))
        {
            String[] templateArguments = methodName.split(";");
            if (templateArguments.length != 3)
            {
                throw new UnsupportedOperationException("Expected three arguments for importTemplate but got " + (templateArguments.length - 1));
            }

            Container ehrStudyContainer = EHRService.get().getEHRStudyContainer(ContainerManager.getRoot());
            User ehrUser = EHRService.get().getEHRUser(ContainerManager.getRoot(), false);

            if (ehrStudyContainer == null)
            {
                LOG.info("EHR Study Container module property not found for extensible column import. Skipping import.");
            }

            if (ehrUser == null)
            {
                LOG.info("EHR Admin User module property not found for extensible column import. Skipping import.");
            }

            if (ehrStudyContainer != null && ehrUser != null)
            {
                String moduleName = templateArguments[1];
                String domainGroup = templateArguments[2];

                Module module = ModuleLoader.getInstance().getModule(moduleName);
                if (module == null)
                    throw new NotFoundException("Module '" + moduleName + "' for domain template import not found");

                DomainTemplateGroup templateGroup = DomainTemplateGroup.get(module, domainGroup);
                if (templateGroup != null)
                {
                    if (templateGroup.hasErrors())
                    {
                        throw new UnsupportedOperationException("Domain template group '" + domainGroup + "' has errors: " + StringUtils.join(templateGroup.getErrors(), "\n"));
                    }
                    try
                    {
                        templateGroup.createAndImport(ehrStudyContainer, ehrUser, true, false);
                    }
                    catch (BatchValidationException e)
                    {
                        throw UnexpectedException.wrap(e);
                    }
                }
                else
                {
                    LOG.error("Domain template '" + domainGroup + "' not found for module '" + moduleName + "'");
                }
            }
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
        if (_reloadFolder || !_etls.isEmpty() || !_tsvImports.isEmpty())
        {
            Container container = EHRService.get().getEHRStudyContainer(ContainerManager.getRoot());
            if (container == null)
            {
                LOG.warn("No EHR study container. Unable to perform upgrade steps for " + _module.getName());
                return;
            }
            if (!container.getActiveModules().contains(_module))
            {
                LOG.warn("EHR container does not have module " + _module.getName() + " enabled. Skipping upgrade work.");
            }

            User user = EHRService.get().getEHRUser(ContainerManager.getRoot());
            if (user == null || !user.isActive())
            {
                LOG.warn("No EHR admin user. Unable to perform upgrade steps for " + _module.getName());
                return;
            }

            try
            {
                for (TsvImport tsvImport : _tsvImports)
                {
                    importFile(tsvImport, container, user);
                }

                if (_reloadFolder)
                {
                    EHRService.get().importFolderDefinition(container, user, _module, new Path("referenceStudy"));
                }
            }
            catch (IOException | SQLException | BatchValidationException | QueryUpdateServiceException e)
            {
                throw UnexpectedException.wrap(e);
            }

            // Truncate and reset all tables before queueing the jobs to reduce contention and possible deadlocks
            for (Map.Entry<String, Boolean> etlInfo : _etls.entrySet())
            {
                if (etlInfo.getValue().booleanValue())
                {
                    Pair<Long, String> result = DataIntegrationService.get().truncateTargets(container, user, etlInfo.getKey());
                    if (result.second != null)
                    {
                        LOG.error("Failed to truncate ETL " + etlInfo.getKey() + ", continuing without queuing a run. Details: " + result.second);
                        continue;
                    }
                    if (!DataIntegrationService.get().resetTransformState(container, user, etlInfo.getKey()))
                    {
                        LOG.info("No saved state for " + etlInfo.getKey() + " found for reset, starting ETL.");
                    }
                }
            }

            // Now queue all the ETL jobs
            for (Map.Entry<String, Boolean> etlInfo : _etls.entrySet())
            {
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

    private void importFile(TsvImport tsvImport, Container container, User user) throws IOException, SQLException, BatchValidationException, QueryUpdateServiceException
    {
        Resource r = _module.getModuleResource(Path.parse(tsvImport._tsvPath));
        if (r == null || !r.isFile())
        {
            throw new IllegalArgumentException("Could not resolve module resource " + tsvImport._tsvPath + " in module " + _module.getName());
        }

        DataLoader loader = DataLoader.get().createLoader(r, true, null, TabLoader.TSV_FILE_TYPE);

        UserSchema schema = QueryService.get().getUserSchema(user, container, tsvImport._schemaName);
        if (schema == null)
        {
            throw new IllegalArgumentException("Could not find schema " + schema + " in " + container.getPath());
        }
        TableInfo table = schema.getTable(tsvImport._queryName);
        if (table == null)
        {
            throw new IllegalArgumentException("Could not find table " + tsvImport._queryName + " in schema " + tsvImport._schemaName + " in " + container.getPath());
        }
        QueryUpdateService updateService = table.getUpdateService();
        if (updateService == null)
        {
            throw new IllegalArgumentException("No query update service for " + tsvImport._schemaName + "." + tsvImport._queryName);
        }

        LOG.info("Importing " + tsvImport._tsvPath + " to " + tsvImport._schemaName + "." + tsvImport._queryName);

        // Delete the current rows
        updateService.truncateRows(user, container, null, null);

        BatchValidationException errors = new BatchValidationException();
        AuditBehaviorType behaviorType = table.getAuditBehavior();
        TransactionAuditProvider.TransactionAuditEvent auditEvent = null;
        if (behaviorType != null && behaviorType != AuditBehaviorType.NONE)
            auditEvent = createTransactionAuditEvent(container, QueryService.AuditAction.INSERT);

        AbstractQueryImportAction.importData(loader, table, updateService, QueryUpdateService.InsertOption.INSERT,
                false, false, errors, behaviorType, auditEvent, user, container);
    }

    private static class TsvImport
    {
        private final String _schemaName;
        private final String _queryName;
        private final String _tsvPath;

        public TsvImport(String schemaName, String queryName, String tsvPath)
        {
            _schemaName = schemaName;
            _queryName = queryName;
            _tsvPath = tsvPath;
        }

        @Override
        public boolean equals(Object o)
        {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            TsvImport tsvImport = (TsvImport) o;
            return _schemaName.equals(tsvImport._schemaName) && _queryName.equals(tsvImport._queryName) && _tsvPath.equals(tsvImport._tsvPath);
        }

        @Override
        public int hashCode()
        {
            return Objects.hash(_schemaName, _queryName, _tsvPath);
        }
    }
}
