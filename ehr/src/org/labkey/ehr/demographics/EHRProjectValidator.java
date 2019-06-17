/*
 * Copyright (c) 2018-2019 LabKey Corporation
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

import org.apache.log4j.Logger;
import org.jetbrains.annotations.Nullable;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.ehr.demographics.AbstractProjectValidator;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.util.PageFlowUtil;

import java.util.Date;

/**
 * A core project validator providing validation for assigned projects for animal
 *
 * Author: ankurj
 * Date: 7/6/2018
 *
 */
public class EHRProjectValidator extends AbstractProjectValidator
{
    @Override
    @Nullable
    public String validateAssignment(String id, Integer projectId, Date date, User user, Container container, String protocol)
    {
        TableInfo ti = getTableInfo(container, user,"study", "Assignment");

        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("Id"), id);
        filter.addCondition(FieldKey.fromString("date"), date, CompareType.DATE_LTE);
        filter.addClause(new SimpleFilter.OrClause(new CompareType.EqualsCompareClause(FieldKey.fromString("project"), CompareType.EQUAL, projectId), new CompareType.CompareClause(FieldKey.fromString("project/protocol"), CompareType.EQUAL, protocol)));
        filter.addClause(new SimpleFilter.OrClause(new CompareType.EqualsCompareClause(FieldKey.fromString("enddate"), CompareType.DATE_GTE, date), new CompareType.CompareClause(FieldKey.fromString("enddate"), CompareType.ISBLANK, null)));
        filter.addCondition(FieldKey.fromString("qcstate/publicdata"), true, CompareType.EQUAL);

        TableSelector ts = new TableSelector(ti, PageFlowUtil.set("project"), filter, null);
        return !ts.exists() ? "Not assigned to the project or protocol on this date" : null;
    }
}
