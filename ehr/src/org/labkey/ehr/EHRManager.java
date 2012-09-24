/*
 * Copyright (c) 2009-2012 LabKey Corporation
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

package org.labkey.ehr;

import org.apache.log4j.Logger;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.Table;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class EHRManager
{
    private static final EHRManager _instance = new EHRManager();
    public static final String EHRStudyContainerPropName = "EHRStudyContainer";
    public static final String EHRAdminUserPropName = "EHRAdminUser";
    public static final String EHRStudyLabel = "Primate Electronic Health Record";

    private static final Logger _log = Logger.getLogger(EHRManager.class);

    private EHRManager()
    {
        // prevent external construction with a private default constructor
    }

    public static EHRManager get()
    {
        return _instance;
    }

    /**
     * @return The value of the EHRSAdminUser, as set in the root container
     */
    public User getEHRUser()
    {
        return getEHRUser(true);
    }

    public User getEHRUser(boolean logOnError)
    {
        try
        {
            Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
            ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRAdminUserPropName);
            String emailAddress = PropertyManager.getCoalecedProperty(0, ContainerManager.getRoot(), mp.getCategory(), EHRManager.EHRAdminUserPropName);
            if (emailAddress == null)
            {
                if (logOnError)
                    _log.error("Attempted to access EHR email module property, which has not been set for the root container");
                return null;
            }

            ValidEmail email = new ValidEmail(emailAddress);
            return UserManager.getUser(email);
        }
        catch (ValidEmail.InvalidEmailException e)
        {
            throw new RuntimeException(e);
        }
    }

    /**
     * @return The value of the EHRStudyContainer, as set in the root container
     */
    public Container getPrimaryEHRContainer()
    {
        return getPrimaryEHRContainer(true);
    }

    public Container getPrimaryEHRContainer(boolean logOnError)
    {
        Module ehr = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        ModuleProperty mp = ehr.getModuleProperties().get(EHRManager.EHRStudyContainerPropName);
        String path = PropertyManager.getCoalecedProperty(0, ContainerManager.getRoot(), mp.getCategory(), EHRManager.EHRAdminUserPropName);
        if (path == null)
        {
            if (logOnError)
                _log.error("Attempted to access EHR containerPath Module Property, which has not been set for the root container");
            return null;
        }

        return ContainerManager.getForPath(path);
    }

    /**
     * This is a somewhat crude method to identify any containers with an EHR study.  A study is identified as an EHR study if the
     * label is "Primate Electronic Health Record" and the EHR module is turned on in that folder.  This was originally written for
     * java upgrade scripts.
     * @return Set of EHR studies
     */
    public Set<Study> getEhrStudies(User u)
    {
        Module ehrModule = ModuleLoader.getInstance().getModule(EHRModule.NAME);
        if (u == null)
            u = getEHRUser(false);

        if (u == null)
        {
            _log.info("EHR User Module Property has not been set for root, cannot find EHR studies");
            return null;
        }

        Set<Study> ehrStudies = new HashSet<Study>();
        Study[] studies = StudyService.get().getAllStudies(ContainerManager.getRoot(), u);
        for (Study s : studies)
        {
            if (EHRStudyLabel.equals(s.getLabel()) && s.getContainer().getActiveModules().contains(ehrModule))
            {
                ehrStudies.add(s);
            }
        }
        return ehrStudies;
    }

    /**
     * The EHR expects certain properties to be present on all dataset.  This will iterate each dataset, add any
     * missing columns and make sure the columns point to the correct propertyURI
     * @param c
     * @param u
     * @param commitChanges
     * @return
     */
    public List<String> ensureDatasetPropertyDescriptors(Container c, User u, boolean commitChanges)
    {
        List<String> messages = new ArrayList<String>();
        messages.add("Changes will be made: " + commitChanges);

        try
        {
            ExperimentService.get().ensureTransaction();

            Study study = StudyService.get().getStudy(c);
            if (study == null) {
                messages.add("No study in this folder");
                return messages;
            }

            List<PropertyDescriptor> properties = new ArrayList<PropertyDescriptor>();

            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.PROJECT.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.ACCOUNT.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.REMARK.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.OBJECTID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.PARENTID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.TASKID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.REQUESTID.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.DESCRIPTION.getPropertyDescriptor().getPropertyURI(), c));
            properties.add(OntologyManager.getPropertyDescriptor(EHRProperties.PERFORMEDBY.getPropertyDescriptor().getPropertyURI(), c));

            List<PropertyDescriptor> otherProperties = new ArrayList<PropertyDescriptor>();
            otherProperties.add(OntologyManager.getPropertyDescriptor(EHRProperties.ENDDATE.getPropertyDescriptor().getPropertyURI(), c));
            otherProperties.add(OntologyManager.getPropertyDescriptor(EHRProperties.DATEREQUESTED.getPropertyDescriptor().getPropertyURI(), c));

            List<? extends DataSet> datasets = study.getDataSets();
            for (DataSet dataset : datasets)
            {
                Domain domain = dataset.getDomain();
                DomainProperty[] dprops = domain.getProperties();
                boolean changed = false;

                for (PropertyDescriptor pd : properties)
                {
                    boolean found = false;
                    for (DomainProperty dp : dprops)
                    {
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            found = true;

                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Setting propertyURI on property: " + pd.getName() + " for dataset: " + dataset.getName());
                                changed = true;

                                if (commitChanges)
                                    dp.setPropertyURI(pd.getPropertyURI());
                            }
                            if (!dp.getName().equals(pd.getName()))
                            {
                                messages.add("Case mismatch for property name for dataset: " + dataset.getName() + " Expected: " + pd.getName() + ", but was: " + dp.getName());
                            }
                        }
                    }

                    if (!found)
                    {
                        messages.add("Missing property: " + pd.getName() + " on dataset: " + dataset.getName());
                        if (commitChanges)
                        {
                            DomainProperty d = domain.addProperty();
                            d.setPropertyURI(pd.getPropertyURI());
                            d.setName(pd.getName());
                            changed = true;
                        }
                    }
                }

                //dont add these, but if they already exist make sure we use the right propertyURI
                for (PropertyDescriptor pd : otherProperties)
                {
                    for (DomainProperty dp : dprops)
                    {
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Missing propertyURI on optional property: " + pd.getName() + " for dataset: " + dataset.getName());
                                //TODO: why cant I set this?
                                changed = true;

                                if (commitChanges)
                                    dp.setPropertyURI(pd.getPropertyURI());
                            }
                        }
                    }
                }

                if (changed)
                {
                    domain.save(u);
                }
//
//                dataset = study.getDataSet(dataset.getDataSetId());
//                if (!dataset.getKeyManagementType().equals(DataSet.KeyManagementType.GUID) && !dataset.isDemographicData())
//                {
//                    messages.add("Setting key management type to GUID for dataset: " + dataset.getName());
//                    if (commitChanges)
//                    {
//                        dataset = StudyService.get().getDataSet(c, dataset.getDataSetId());
//                        DataSet mutable = (DataSet)dataset.createMutable();
//                        mutable.setKeyManagementType(DataSet.KeyManagementType.GUID);
//                        mutable.setKeyPropertyName(EHRProperties.OBJECTID.getPropertyDescriptor().getName());
//                        mutable.save(u);
//                    }
//                }

            }

            //ensure keymanagement type
            if (commitChanges)
            {
                messages.add("Ensuring all non-demographics datasets use objectId as a managed key");
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("UPDATE study.dataset SET keymanagementtype=?, keypropertyname=? WHERE demographicdata=? AND container=?", "GUID", "objectid", false, c.getEntityId());
                Table.execute(studySchema, sql);
            }

            ExperimentService.get().commitTransaction();
        }
        catch (SQLException e)
        {
            throw new RuntimeSQLException(e);

        }
        catch (ChangePropertyDescriptorException e)
        {
            throw new RuntimeException(e);
        }
        finally
        {
            ExperimentService.get().closeTransaction();
        }

        return messages;
    }
}