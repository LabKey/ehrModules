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
package org.labkey.api.ehr.history;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * A specific kind of clinical history, representing lab work results, typically as a panel that may
 * de-pivot from a long skinny representing to a single "row" with separate columns for each individual test.
 * User: bimber
 * Date: 3/6/13
 */
public interface LabworkType
{
    String getName();

    boolean isEnabled(Container c);

    List<String> getResults(Container c, User u, String runId, boolean redacted);

    Map<String, List<String>> getResults(Container c, User u, List<String> runIds, boolean redacted);

    Map<String, List<String>> getResults(Container c, User u, String id, Date minDate, Date maxDate, boolean redacted);
}
