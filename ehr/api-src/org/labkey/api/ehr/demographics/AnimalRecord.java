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
package org.labkey.api.ehr.demographics;

import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Cached summary information from an animal. Records should always be fully populated with all available information
 * @see DemographicsProvider
 * @see org.labkey.api.ehr.EHRDemographicsService
 * User: bimber
 * Date: 7/14/13
 */
public interface AnimalRecord
{
    /** @return a clone of this record */
    AnimalRecord createCopy();

    String getId();

    Container getContainer();

    Date getCreated();

    /** @return the full set of cached properties */
    @NotNull Map<String, Object> getProps();

    // Below are convenience methods for specific cached properties
    String getGender();

    String getGenderMeaning();

    String getOrigGender();

    String getAgeInYearsAndDays();

    String getSpecies();

    String getCalculatedStatus();

    Date getBirth();

    boolean hasBirthRecord();

    Date getDeath();

    String getGeographicOrigin();

    String getDemographicsObjectId();

    List<Map<String, Object>> getActiveAssignments();

    List<Map<String, Object>> getActiveTreatments();

    List<Map<String, Object>> getActiveHousing();

    String getCurrentRoom();

    String getCurrentCage();

    List<Map<String, Object>> getActiveFlags();

    List<Map<String, Object>> getActiveProblem();

    List<Map<String, Object>> getActiveCases();

    List<Map<String, Object>> getParents();

    List<Map<String, Object>> getWeights();

    Double getMostRecentWeight();

    Date getMostRecentWeightDate();

    Date getMostRecentDeparture();

    Date getMostRecentArrival();

    Integer getDaysSinceWeight();
}
