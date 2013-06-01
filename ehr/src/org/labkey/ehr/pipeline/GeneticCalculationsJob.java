/*
 * Copyright (c) 2013 LabKey Corporation
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
package org.labkey.ehr.pipeline;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

/**
 * User: bimber
 * Date: 4/25/13
 * Time: 5:56 PM
 */
public class GeneticCalculationsJob implements Job
{
    public final static String GENETICCALCULATIONS_PROPERTY_DOMAIN = "org.labkey.ehr.geneticcalculations";

    public GeneticCalculationsJob()
    {

    }

    public void schedule()
    {

    }

    public void execute(JobExecutionContext context) throws JobExecutionException
    {

    }
}
