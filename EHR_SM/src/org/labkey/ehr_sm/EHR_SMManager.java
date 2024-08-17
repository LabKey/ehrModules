/*
 * Copyright (c) 2022 LabKey Corporation
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

package org.labkey.ehr_sm;

public class EHR_SMManager
{
    private static final EHR_SMManager _instance = new EHR_SMManager();

    public static final String ANIMAL_SAMPLE_PROP_SET_NAME = "AnimalSamplePropSet";
    public static final String ANIMAL_SAMPLE_RECEIVED_PROP = "sampleReceivedCol";

    private EHR_SMManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EHR_SMManager get()
    {
        return _instance;
    }
}