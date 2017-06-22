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

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

/**
 * A source for a specific type of demographic summary data for animals, such as SPF status, recent weights,
 * or current housing.
 *
 * User: bimber
 * Date: 7/9/13
 */
public interface DemographicsProvider
{
    /** The maximum number of animals that will be requested to load at once in any given bulk operation */
    int MAXIMUM_BATCH_SIZE = 1000;

    String getName();

    boolean isAvailable(Container c, User u);

    Map<String, Map<String, Object>> getProperties(Container c, User u, Collection<String> ids);

    /**
     * report whether this provider requires calculation of cached data when a row in this passed table has changed
     * this is a somewhat blunt approach, but it errs on the side of re-calculating
     */
    boolean requiresRecalc(String schema, String query);

    /** @return the top-level keys used by this provider in the map of cached data */
    Set<String> getKeys();

    /**
     * @return the keys to be compared in newly cached records vs the previous cache for the same animal. Used
     * to detect when the cache becomes stale because underlying data has changed without triggering a cache refresh.
     */
    Collection<String> getKeysToTest();

    /**
     * Allows specific providers to inspect changes and potentially signal other animals to reache.
     * For example, if one animal's housing changes, it's likely that its previous cagemates need to have their
     * cagemates cached information refreshed, as do the animals in the cage it just moved into.
     */
    Set<String> getIdsToUpdate(Container c, String id, Map<String, Object> originalProps, Map<String, Object> newProps);
}
