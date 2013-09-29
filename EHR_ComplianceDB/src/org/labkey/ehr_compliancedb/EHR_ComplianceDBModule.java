package org.labkey.ehr_compliancedb;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.DbSchema;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.WebPartFactory;

import java.util.Collection;
import java.util.Collections;
import java.util.Set;

/**
 * User: bimber
 * Date: 9/13/13
 * Time: 11:45 AM
 */
public class EHR_ComplianceDBModule extends ExtendedSimpleModule
{
    public static final String NAME = "EHR_ComplianceDB";
    public static final String CONTROLLER_NAME = "ehr_compliancedb";
    public static final String SCHEMA_NAME = "ehr_compliancedb";

    @Override
    public String getName()
    {
        return NAME;
    }

    @Override
    public double getVersion()
    {
        return 12.35;
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }

    @Override
    protected Collection<WebPartFactory> createWebPartFactories()
    {
        return Collections.emptyList();
    }

    @Override
    protected void init()
    {
        addController(CONTROLLER_NAME, EHR_ComplianceDBController.class);
    }

    @Override
    @NotNull
    public Set<String> getSchemaNames()
    {
        return Collections.singleton(SCHEMA_NAME);
    }

    @Override
    @NotNull
    public Set<DbSchema> getSchemasToTest()
    {
        return Collections.singleton(DbSchema.get(SCHEMA_NAME));
    }

    @Override
    protected void registerSchemas()
    {
        EHR_ComplianceDBUserSchema.register(this);
    }
}
