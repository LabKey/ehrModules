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

import org.labkey.api.data.CompareType;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.ehr.demographics.AbstractListDemographicsProvider;
import org.labkey.api.query.FieldKey;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * User: bimber
 * Date: 7/14/13
 * Time: 10:29 AM
 */
public class ActiveTreatmentsDemographicsProvider extends AbstractListDemographicsProvider
{
    public ActiveTreatmentsDemographicsProvider()
    {
        super("study", "Treatment Orders", "activeTreatments");
    }

    protected Set<FieldKey> getFieldKeys()
    {
        Set<FieldKey> keys = new HashSet<FieldKey>();
        keys.add(FieldKey.fromString("lsid"));
        keys.add(FieldKey.fromString("Id"));
        keys.add(FieldKey.fromString("code"));
        keys.add(FieldKey.fromString("code/meaning"));
        keys.add(FieldKey.fromString("date"));
        keys.add(FieldKey.fromString("enddate"));
        keys.add(FieldKey.fromString("performedby"));
        keys.add(FieldKey.fromString("route"));

        keys.add(FieldKey.fromString("dosage"));
        keys.add(FieldKey.fromString("dosage_units"));
        keys.add(FieldKey.fromString("amount"));
        keys.add(FieldKey.fromString("amount_units"));
        keys.add(FieldKey.fromString("concentration"));
        keys.add(FieldKey.fromString("concentration_units"));
        keys.add(FieldKey.fromString("volume"));
        keys.add(FieldKey.fromString("vol_units"));

        keys.add(FieldKey.fromString("remark"));
        keys.add(FieldKey.fromString("frequency"));
        keys.add(FieldKey.fromString("frequency/meaning"));

        keys.add(FieldKey.fromString("amountWithUnits"));
        keys.add(FieldKey.fromString("category"));
        keys.add(FieldKey.fromString("daysElapsed"));

        return keys;
    }

    @Override
    protected SimpleFilter getFilter(Collection<String> ids)
    {
        SimpleFilter filter = super.getFilter(ids);
        filter.addCondition(FieldKey.fromString("isActive"), true, CompareType.EQUAL);
        filter.addCondition(FieldKey.fromString("qcstate/publicData"), true, CompareType.EQUAL);

        return filter;
    }
}
