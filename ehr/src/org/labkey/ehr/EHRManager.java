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
import org.labkey.api.cache.CacheManager;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.DbSchema;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.data.RuntimeSQLException;
import org.labkey.api.data.SQLFragment;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.SqlSelector;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.OntologyManager;
import org.labkey.api.exp.PropertyDescriptor;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.exp.query.ExpSchema;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.module.ModuleProperty;
import org.labkey.api.query.FieldKey;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.study.DataSet;
import org.labkey.api.study.Study;
import org.labkey.api.study.StudyService;
import org.labkey.api.util.ResultSetUtil;

import java.beans.Introspector;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
            boolean shouldClearCaches = false;

            for (DataSet dataset : datasets)
            {
                //TODO: skip query snapshots

                Domain domain = dataset.getDomain();
                DomainProperty[] dprops = domain.getProperties();
                boolean changed = false;
                List<PropertyDescriptor> toUpdate = new ArrayList<PropertyDescriptor>();

                for (PropertyDescriptor pd : properties)
                {
                    boolean found = false;
                    for (DomainProperty dp : dprops)
                    {
                        //if the expected property is present, verify datatype and propertyURI
                        if (dp.getName().equalsIgnoreCase(pd.getName()))
                        {
                            found = true;

                            if (!dp.getPropertyURI().equals(pd.getPropertyURI()))
                            {
                                messages.add("Need to replace propertyURI on property \"" + pd.getName() + "\" for dataset " + dataset.getName());
                                if (commitChanges)
                                {
                                    toUpdate.add(pd);
                                }
                            }

                            if (!dp.getName().equals(pd.getName()))
                            {
                                messages.add("Case mismatch for property in dataset: " + dataset.getName() + ".  Expected: " + pd.getName() + ", but was: " + dp.getName() + ". This has not been automatically changed");
                            }
                        }
                    }

                    if (!found)
                    {
                        messages.add("Missing property \"" + pd.getName() + "\" on dataset: " + dataset.getName() + ".  Needs to be created.");
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
                                messages.add("Incorrect propertyURI on optional property \"" + pd.getName() + "\" for dataset: " + dataset.getName() +".  Needs to be updated.");

                                if (commitChanges)
                                {
                                    toUpdate.add(pd);
                                }
                            }
                        }
                    }
                }

                if (changed)
                {
                    domain.save(u);
                    shouldClearCaches = true;
                }

                if (toUpdate.size() > 0)
                    shouldClearCaches = true;

                for (PropertyDescriptor pd : toUpdate)
                {
                    updatePropertyURI(domain, pd);
                }
            }

            //ensure keymanagement type
            if (commitChanges)
            {
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("UPDATE study.dataset SET keymanagementtype=?, keypropertyname=? WHERE demographicdata=? AND container=?", "GUID", "objectid", false, c.getEntityId());
                long total = Table.execute(studySchema, sql);
                messages.add("Non-demographics datasets updated to use objectId as a managed key: "+ total);
            }
            else
            {
                DbSchema studySchema = DbSchema.get("study");
                SQLFragment sql = new SQLFragment("SELECT * FROM study.dataset WHERE keymanagementtype!=? AND demographicdata=? AND container=?", "GUID", false, c.getEntityId());
                long total = Table.execute(studySchema, sql);
                if (total > 0)
                    messages.add("Non-demographics datasets that are not using objectId as a managed key: " + total);
            }

            ExperimentService.get().commitTransaction();

            if (shouldClearCaches)
            {
                Introspector.flushCaches();
                CacheManager.clearAllKnownCaches();
            }
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

    //NOTE: this assumes the property already exists
    private void updatePropertyURI(Domain d, PropertyDescriptor pd) throws SQLException
    {
        Table.TableResultSet results = null;

        try
        {
            DbSchema expSchema = DbSchema.get(ExpSchema.SCHEMA_NAME);
            TableInfo propertyDomain = expSchema.getTable("propertydomain");
            TableInfo propertyDescriptor = expSchema.getTable("propertydescriptor");

            //find propertyId
            TableSelector ts = new TableSelector(propertyDescriptor, Collections.singleton("propertyid"), new SimpleFilter(FieldKey.fromString("PropertyURI"), pd.getPropertyURI()), null);
            Integer[] ids = ts.getArray(Integer.class);
            if (ids.length == 0)
            {
                throw new SQLException("Unknown propertyURI: " + pd.getPropertyURI());
            }
            int propertyId = ids[0];

            //first ensure the propertyURI exists
            SQLFragment sql = new SQLFragment("select propertyid from exp.propertydomain p where domainId = ? AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name " + (expSchema.getSqlDialect().isPostgreSQL() ? "ilike" : "like") + " ?)", d.getTypeId(), pd.getName());
            SqlSelector selector = new SqlSelector(expSchema.getScope(), sql);
            results = selector.getResultSet();

            List<Integer> oldIds = new ArrayList<Integer>();
            while (results.next())
            {
                Map<String, Object> row = results.getRowMap();
                oldIds.add((Integer)row.get("propertyid"));
            }

            if (oldIds.size() == 0)
            {
                //this should not happen
                throw new SQLException("Unexpected: propertyId " + pd.getPropertyURI() + " does not exists for domain: " + d.getTypeURI());
            }

            if (oldIds.size() == 1 && oldIds.contains(propertyId))
            {
                //property ID already correct
                return;
            }

            if (oldIds.size() == 1)
            {
                //only 1 ID, but not using correct propertyURI
                String updateSql = "UPDATE exp.propertydomain SET propertyid = ? where domainId = ? AND propertyid = ?";
                long updated = Table.execute(expSchema.getScope().getConnection(), updateSql, propertyId, d.getTypeId(), oldIds.get(0));

                String deleteSql = "DELETE FROM exp.propertydescriptor WHERE propertyid = ?";
                long deleted = Table.execute(expSchema.getScope().getConnection(), deleteSql, oldIds.get(0));
            }
            else
            {
                //if more than 1 row exists, this means we have duplicate property descriptors
                SQLFragment selectSql = new SQLFragment("select min(sortorder) from exp.propertydomain p where domainId = ? AND propertyid in (select propertyid from exp.propertydescriptor pd where pd.name = ?");
                SqlSelector ss = new SqlSelector(expSchema.getScope(), selectSql);
                ResultSet resultSet = ss.getResultSet();
                Integer minSort = resultSet.getInt(0);

                String updateSql = "UPDATE exp.propertydomain SET propertyid = ? where domainId = ? AND propertyid IN ? AND sortorder = ?";
                Table.execute(expSchema.getScope().getConnection(), updateSql, propertyId, d.getTypeId(), oldIds, minSort);

                String deleteSql1 = "DELETE FROM exp.propertydescriptor WHERE propertyid != ? AND propertyid IN ?";
                Table.execute(expSchema.getScope().getConnection(), deleteSql1, propertyId, oldIds);

                String deleteSql2 = "DELETE FROM exp.propertydomain WHERE propertyid != ? AND domainId = ? AND propertyid IN ? AND sortorder != ?";
                Table.execute(expSchema.getScope().getConnection(), deleteSql2, propertyId, d.getTypeId(), oldIds, minSort);
            }
        }
        finally
        {
            ResultSetUtil.close(results);
        }
    }
}