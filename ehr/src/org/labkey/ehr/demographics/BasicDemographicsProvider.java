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
package org.labkey.ehr.demographics;

import org.labkey.api.ehr.demographics.AbstractDemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/9/13
 * Time: 9:42 PM
 */
public class BasicDemographicsProvider extends AbstractDemographicsProvider
{
    public BasicDemographicsProvider()
    {
        super("study", "Demographics");
    }

    public String getName()
    {
        return "BasicDemographics";
    }

    protected Collection<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        //Id/curLocation/area,Id/curLocation/room,Id/curLocation/cage,Id/curLocation/date,

        keys.add(FieldKey.fromString("lsid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("gender"));
        keys.add(FieldKey.fromString("gender/meaning"));
        keys.add(FieldKey.fromString("gender/origGender"));
        keys.add(FieldKey.fromString("species"));
        keys.add(FieldKey.fromString("calculated_status"));
        keys.add(FieldKey.fromString("birth"));
        keys.add(FieldKey.fromString("death"));
        keys.add(FieldKey.fromString("geographic_origin"));

        keys.add(FieldKey.fromString("dam"));
        keys.add(FieldKey.fromString("sire"));

        keys.add(FieldKey.fromString("Id/age/yearAndDays"));
        keys.add(FieldKey.fromString("Id/age/ageInDays"));

        return keys;
    }
}
