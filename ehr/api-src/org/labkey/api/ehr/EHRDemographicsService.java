/*
 * Copyright (c) 2012-2017 LabKey Corporation
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
import org.labkey.api.ehr.demographics.AnimalRecord;

import java.util.Collection;
import java.util.List;

/**
 * Caches key demographic summary data for animals, allowing for quick recall without needing to query against
 * many tables each time we need to show a Snapshot view or similar.
 *
 * User: bimber
 * Date: 9/14/12
 */
abstract public class EHRDemographicsService
{
    static EHRDemographicsService _instance;

    public static EHRDemographicsService get()
    {
        return _instance;
    }

    static public void setInstance(EHRDemographicsService instance)
    {
        _instance = instance;
    }

    /**
     * Alerts the service that data has changed in a given table for a set of animals
     */
    abstract public void reportDataChange(final Container c, final String schema, final String query, final List<String> ids);

    abstract public AnimalRecord getAnimal(Container c, String id);

    abstract public List<AnimalRecord> getAnimals(Container c, Collection<String> ids);
}
