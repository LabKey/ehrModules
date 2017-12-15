/*
 * Copyright (c) 2013-2017 LabKey Corporation
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
package org.labkey.ehr_compliancedb;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.DbSchemaType;
import org.labkey.api.ldk.ExtendedSimpleModule;
import org.labkey.api.ldk.LDKService;
import org.labkey.api.ldk.notification.NotificationService;
import org.labkey.ehr_compliancedb.notification.EmployeeComplianceNotification;
import org.labkey.api.module.ModuleContext;

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
        return 12.38;
    }

    @Override
    public boolean hasScripts()
    {
        return true;
    }

    @Override
    protected void init()
    {
        addController(CONTROLLER_NAME, EHR_ComplianceDBController.class);
    }

    @Override
    protected void doStartupAfterSpringConfig(ModuleContext moduleContext)
    {

        NotificationService ns = NotificationService.get();

        LDKService.get().registerContainerScopedTable(EHR_ComplianceDBModule.SCHEMA_NAME, EHR_ComplianceDBUserSchema.TABLE_REQUIREMENTS, "requirementname");

          //Added 3-29-2016 Blasa
          ns.registerNotification(new EmployeeComplianceNotification(this));
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
        return Collections.singleton(DbSchema.get(SCHEMA_NAME, DbSchemaType.Module));
    }

    @Override
    protected void registerSchemas()
    {
        EHR_ComplianceDBUserSchema.register(this);
    }
}
