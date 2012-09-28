/*
 * Copyright (c) 2012 LabKey Corporation
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
package org.labkey.ehr.study;

import org.apache.log4j.Logger;
import org.labkey.api.data.UpgradeCode;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.PropertyType;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.module.ModuleContext;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.ehr.EHRManager;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: bimber
 * Date: 9/12/12
 * Time: 4:02 PM
 */
public class EHRStudyUpgradeCode implements UpgradeCode
{
    private static final Logger _log = Logger.getLogger(EHRStudyUpgradeCode.class);

    /** called at 12.23-12.24 */
    @SuppressWarnings({"UnusedDeclaration"})
    public void modifyStudyColumns1(final ModuleContext moduleContext)
    {
        Map<String, PropertyType> cols = new HashMap<String, PropertyType>();
        cols.put("birthCondition", PropertyType.INTEGER);
        cols.put("deliveryLocation", PropertyType.INTEGER);
        ensureDatasetColumns(moduleContext, "Organ Weights", cols);
    }

    /** called at XXXX-XXXX */
    @SuppressWarnings({"UnusedDeclaration"})
    public void modifyStudyColumns2(final ModuleContext moduleContext)
    {
        //organ weights
        Map<String, PropertyType> cols = new HashMap<String, PropertyType>();
        cols.put("appearance", PropertyType.STRING);
        cols.put("preparation", PropertyType.STRING);
        ensureDatasetColumns(moduleContext, "Organ Weights", cols);

        //blood draws
        cols = new HashMap<String, PropertyType>();
        cols.put("needlesticks", PropertyType.INTEGER);
        ensureDatasetColumns(moduleContext, "Blood Draws", cols);
    }

    public void ensureDatasetColumns(ModuleContext moduleContext, String label, Map<String, PropertyType> cols)
    {
        try
        {
            Set<Study> studies = EHRManager.get().getEhrStudies(moduleContext.getUpgradeUser());
            if (studies != null)
            {
                for (Study s : studies)
                {
                    int id = StudyService.get().getDatasetId(s.getContainer(), label);
                    boolean changed = false;
                    if (id > 0)
                    {
                        DataSet d = s.getDataSet(id);
                        if (d != null)
                        {
                            Domain domain = d.getDomain();
                            Set<String> foundCols = new HashSet<String>();
                            for (DomainProperty dp : domain.getProperties())
                            {
                                for (String colName : cols.keySet())
                                {
                                    if (dp.getName().equals(colName))
                                    {
                                        foundCols.add(colName);
                                    }
                                }
                            }

                            for (String colName : cols.keySet())
                            {
                                if (!foundCols.contains(colName))
                                {
                                    DomainProperty dp = domain.addProperty();
                                    dp.setName(colName);
                                    dp.setRangeURI(cols.get(colName).getTypeUri());

                                    //TODO: can this be better?
                                    dp.setPropertyURI(domain.getTypeURI() + "#" + colName);
                                    changed = true;

                                }
                            }

                            if (changed)
                            {
                                domain.save(moduleContext.getUpgradeUser());
                            }
                        }
                    }
                }
            }
        }
        catch (ChangePropertyDescriptorException e)
        {
            throw new RuntimeException(e);
        }
    }
}
