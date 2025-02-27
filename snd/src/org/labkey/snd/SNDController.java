/*
 * Copyright (c) 2017-2019 LabKey Corporation
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

package org.labkey.snd;

import org.json.JSONArray;
import org.json.JSONObject;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.FormHandlerAction;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleApiJsonForm;
import org.labkey.api.action.SimpleRedirectAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.gwt.client.DefaultValueType;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.module.Module;
import org.labkey.api.security.RequiresLogin;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.snd.AttributeData;
import org.labkey.api.snd.Event;
import org.labkey.api.snd.EventData;
import org.labkey.api.snd.EventNarrativeOption;
import org.labkey.api.snd.Package;
import org.labkey.api.snd.Project;
import org.labkey.api.snd.ProjectItem;
import org.labkey.api.snd.QCStateEnum;
import org.labkey.api.snd.SNDSequencer;
import org.labkey.api.snd.SNDService;
import org.labkey.api.snd.SuperPackage;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.GUID;
import org.labkey.api.util.JsonUtil;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.snd.security.SNDSecurityManager;
import org.labkey.snd.security.permissions.SNDPackageEditorPermission;
import org.labkey.snd.security.permissions.SNDPackageViewerPermission;
import org.labkey.snd.security.permissions.SNDProjectEditorPermission;
import org.labkey.snd.security.permissions.SNDProjectViewerPermission;
import org.labkey.snd.trigger.test.SNDTestEventTriggerFactory;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.io.IOException;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class SNDController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(SNDController.class);
    public static final String NAME = "snd";

    public SNDController()
    {
        setActionResolver(_actionResolver);
    }



    private Map<GWTPropertyDescriptor, Object> getExtraFields(JSONArray jsonExtras) throws IOException
    {
        Map<GWTPropertyDescriptor, Object> extras = new HashMap<>();
        JSONObject extra;
        for (int e = 0; e < jsonExtras.length(); e++)
        {
            extra = jsonExtras.getJSONObject(e);
            extras.put(SNDServiceImpl.jsonToPropertyDescriptor(extra), extra.optString("value", null));
        }

        return extras;
    }

    @RequiresLogin
    public class BeginAction extends SimpleRedirectAction
    {
        @Override
        public URLHelper getRedirectURL(Object o)
        {
            return new ActionURL(NAME, "app", getContainer());
        }
    }

    @RequiresPermission(SNDPackageEditorPermission.class)
    public class SavePackageAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        private GWTPropertyDescriptor convertJsonToPropertyDescriptor(JSONObject json, BindException errors) throws IOException
        {
            String rangeUri = json.getString("rangeURI");
            String format = json.optString("format", null);

            if (rangeUri.equals(SNDManager.RANGE_PARTICIPANTID))
            {
                json.put("conceptURI", "http://cpas.labkey.com/Study#" + SNDManager.RANGE_PARTICIPANTID);
                rangeUri = "string";
            }
            else if (rangeUri.equals("string"))
            {
                json.put("scale", 4000);
            }

            // Check valid formatting of decimal values
            if (rangeUri.equals("double") && format != null)
            {
                try
                {
                    new DecimalFormat(format);
                }
                catch (IllegalArgumentException e)
                {
                    errors.reject(ERROR_MSG, "Invalid decimal format: " + format);
                }
            }
            else
            {
                json.put("format", "");
            }

            json.put("rangeURI", "http://www.w3.org/2001/XMLSchema#" + rangeUri);
            json.put("defaultTypeValue", DefaultValueType.FIXED_EDITABLE.toString());

            String defaultValue = json.optString("defaultValue", null);
            json.put("defaultValue", defaultValue);

            return SNDServiceImpl.jsonToPropertyDescriptor(json);
        }

        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();
            Package pkg = new Package();
            boolean cloneFlag = json.optBoolean("clone");
            int testIdNumberStart = json.optInt("testIdNumberStart", -1);
            int pkgId = json.optInt("id", -1);
            pkg.setPkgId(pkgId);

            pkg.setDescription(json.getString("description"));
            pkg.setActive(json.getBoolean("active"));
            pkg.setRepeatable(json.getBoolean("repeatable"));
            pkg.setNarrative(json.getString("narrative"));

            // Get extra fields
            JSONArray jsonExtras = json.optJSONArray("extraFields");
            if (null != jsonExtras)
            {
                try
                {
                    pkg.setExtraFields(getExtraFields(jsonExtras));
                }
                catch (IOException e)
                {
                    errors.reject(ERROR_MSG, "Extra fields could not be parsed: " + e.getMessage());
                }
            }

            // Get categories
            JSONArray jsonCategories = json.getJSONArray("categories");
            if (null != jsonCategories)
            {
                Map<Integer, String> categories = new HashMap<>();
                for (int j = 0; j < jsonCategories.length(); j++)
                {
                    categories.put(jsonCategories.getInt(j), null);
                }
                pkg.setCategories(categories);
            }

            // Get attributes
            JSONArray attribs = json.optJSONArray("attributes");
            List<String> attNames = new ArrayList<>();
            if (null != attribs)
            {
                List<GWTPropertyDescriptor> pds = new ArrayList<>();
                for (JSONObject attrib : JsonUtil.toJSONObjectList(attribs))
                {
                    String name = attrib.getString("name");
                    if (attNames.contains(name))
                    {
                        errors.reject(ERROR_MSG, "Attributes must have unique names within a package.");
                        break;
                    }
                    attNames.add(name);
                    try
                    {
                        pds.add(convertJsonToPropertyDescriptor(attrib, errors));
                    }
                    catch (IOException e)
                    {
                        errors.reject("Unable to parse attribute property: " + e.getMessage());
                    }
                }
                pkg.setAttributes(pds);
            }

            if (!errors.hasErrors())
            {
                // Get super packages
                JSONArray jsonSubPackages = json.getJSONArray("subPackages");  // only first-level children (as super package IDs) should be here
                Map<Integer, LinkedList<SuperPackageInfo>> superPkgIdToExtraInfoMap = new HashMap<>();  // uses lists because top-level super package IDs might show up multiple times
                List<Integer> uiSubSuperPkgIds = new ArrayList<>();

                // create super package for root, if needed
                SuperPackage superPackage = SNDManager.getTopLevelSuperPkgForPkg(getContainer(), getUser(), pkg.getPkgId());
                // in cloning case, set package ID to -1 here to force a new package to be created during save
                if (cloneFlag)
                    pkg.setPkgId(-1);
                Integer rootSuperPackageId;
                if ((superPackage == null) || cloneFlag)
                {
                    superPackage = new SuperPackage();
                    if (testIdNumberStart != -1)
                    {
                        rootSuperPackageId = SNDSequencer.SUPERPKGID.ensureId(getContainer(), testIdNumberStart);
                        testIdNumberStart++;
                    }
                    else
                    {
                        rootSuperPackageId = SNDSequencer.SUPERPKGID.ensureId(getContainer(), null);
                    }
                    superPackage.setSuperPkgId(rootSuperPackageId);
                    superPackage.setSuperPkgPath(Integer.toString(rootSuperPackageId));
                }
                else
                {
                    rootSuperPackageId = superPackage.getSuperPkgId();
                }

                superPackage.setRequired(false); // Top level super packages required is always false

                if (null != jsonSubPackages && jsonSubPackages.length() > 0)
                {
                    for (JSONObject jsonSubPackage : JsonUtil.toJSONObjectList(jsonSubPackages))
                    {
                        Integer superPkgId = jsonSubPackage.getInt("superPkgId");

                        if (SNDManager.get().isDescendent(getContainer(), getUser(), superPkgId, pkgId))
                        {
                            errors.reject(ERROR_MSG, "Circular package hierarchy error. Verify assigned packages do not contain this package.");
                            break;
                        }

                        uiSubSuperPkgIds.add(superPkgId);
                        LinkedList<SuperPackageInfo> superPackageInfos = superPkgIdToExtraInfoMap.get(superPkgId);
                        SuperPackageInfo superPackageInfo = new SuperPackageInfo();
                        if (superPackageInfos == null)
                        {
                            superPackageInfos = new LinkedList<>();
                            superPkgIdToExtraInfoMap.put(superPkgId, superPackageInfos);
                        }

                        superPackageInfo.setSortOrder(jsonSubPackage.getInt("sortOrder"));
                        Object required = jsonSubPackage.get("required");
                        if (required == null)
                        {
                            Object errorPkgId = jsonSubPackage.get("pkgId");
                            errors.reject(ERROR_MSG, "Parameter 'required' is missing for subPackage with package ID " + errorPkgId + ".");
                            break;
                        }
                        superPackageInfo.setRequired((Boolean) required);
                        superPackageInfos.add(superPackageInfo);
                    }

                    List<SuperPackage> topLevelSuperPkgs;
                    List<SuperPackage> topLevelChildSuperPackages = new ArrayList<>();
                    if (!errors.hasErrors())
                    {
                        // step 1: process all top level super packages (i.e. super packages that need to have a new child super package created for them)
                        // if cloning, need to make all new child super packages by getting all top-level super packages for this super package
                        if (cloneFlag)
                        {
                            topLevelSuperPkgs = SNDManager.convertToTopLevelSuperPkgs(getContainer(), getUser(), uiSubSuperPkgIds);
                            List<SuperPackage> uiSuperPkgs = SNDManager.getSuperPkgs(getContainer(), getUser(), uiSubSuperPkgIds);
                            Map<Integer, Integer> superPkgIdToPkgIdMap = new HashMap<>();

                            // need to get proper package IDs from db since they're not coming in from UI
                            if (uiSuperPkgs != null)
                            {
                                for (SuperPackage superPkg : uiSuperPkgs)
                                {
                                    superPkgIdToPkgIdMap.put(superPkg.getSuperPkgId(), superPkg.getPkgId());
                                }
                            }

                            if (topLevelSuperPkgs != null)
                            {
                                // now we need to create a list of child super packages based on topLevelSuperPackages and uiSuperPackageIds
                                // (topLevelSuperPkgs is really kind of a list of prototypes to be selected from, sometimes multiple times)

                                // CONSIDER: create maps to speed up lookups here if the number of super packages grows large
                                for (Integer uiSubSuperPkgId : uiSubSuperPkgIds)
                                {
                                    for (SuperPackage topLevelSuperPkg : topLevelSuperPkgs)
                                    {
                                        if (superPkgIdToPkgIdMap.get(uiSubSuperPkgId).equals(topLevelSuperPkg.getPkgId()))
                                        {
                                            // set additional info on top-level super package
                                            setAdditionalSuperPackageInfo(superPkgIdToExtraInfoMap.get(uiSubSuperPkgId), topLevelSuperPkg);

                                            // use copy constructor to copy this top-level super package into a new child super package
                                            // NOTE: this does not create new grandchild super packages! even in the clone case, this is actually the desired behavior
                                            topLevelChildSuperPackages.add(new SuperPackage(topLevelSuperPkg));
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        // if not cloning, just make new child super packages for super packages which were just added (meaning top-level ones)
                        else
                        {
                            topLevelSuperPkgs = SNDManager.filterTopLevelSuperPkgs(getContainer(), getUser(), uiSubSuperPkgIds);

                            if (topLevelSuperPkgs != null)
                            {
                                // now we need to create a list of child super packages based on topLevelSuperPackages and uiSuperPackageIds
                                // (topLevelSuperPkgs is really kind of a list of prototypes to be selected from, sometimes multiple times)

                                // CONSIDER: create maps to speed up lookups here if the number of super packages grows large
                                for (Integer uiSuperPkgId : uiSubSuperPkgIds)
                                {
                                    for (SuperPackage topLevelSuperPkg : topLevelSuperPkgs)
                                    {
                                        if (uiSuperPkgId.equals(topLevelSuperPkg.getSuperPkgId()))
                                        {
                                            // set additional info on top-level super package
                                            setAdditionalSuperPackageInfo(superPkgIdToExtraInfoMap.get(uiSuperPkgId), topLevelSuperPkg);

                                            // use copy constructor to copy this top-level super package into a new child super package
                                            // NOTE: this does not create new grandchild super packages! even in the clone case, this is actually the desired behavior
                                            topLevelChildSuperPackages.add(new SuperPackage(topLevelSuperPkg));
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if (topLevelSuperPkgs != null)
                        {
                            // next we need to transform the top-level super packages from above into new child super packages
                            for (SuperPackage topLevelChildSuperPackage : topLevelChildSuperPackages)
                            {
                                // make new super package ID since we are copying this top-level super package
                                if (testIdNumberStart != -1)
                                {
                                    topLevelChildSuperPackage.setSuperPkgId(SNDSequencer.SUPERPKGID.ensureId(getContainer(), testIdNumberStart));
                                    testIdNumberStart++;
                                }
                                else
                                {
                                    topLevelChildSuperPackage.setSuperPkgId(SNDSequencer.SUPERPKGID.ensureId(getContainer(), null));
                                }
                                // the parent for this child super package is the current super package being saved
                                topLevelChildSuperPackage.setParentSuperPkgId(rootSuperPackageId);
                            }
                        }

                        // step 2: get existing child super packages and set their sort orders
                        List<SuperPackage> regularChildSuperPackages = null;
                        if (!cloneFlag)  // should never be using any existing child super packages in the clone case
                        {
                            regularChildSuperPackages = SNDManager.filterChildSuperPkgs(getContainer(), getUser(), uiSubSuperPkgIds, rootSuperPackageId);
                            if (regularChildSuperPackages != null)
                            {
                                for (SuperPackage childSuperPackage : regularChildSuperPackages)
                                {
                                    // set additional info on child super package (should only be one set in this case)
                                    setAdditionalSuperPackageInfo(superPkgIdToExtraInfoMap.get(childSuperPackage.getSuperPkgId()), childSuperPackage);
                                }
                            }
                        }

                        // now that both steps are complete, set subPackages to be all the new or modified super packages and save
                        ArrayList<SuperPackage> subSuperPackages = new ArrayList<>(topLevelChildSuperPackages);
                        if (regularChildSuperPackages != null)
                            subSuperPackages.addAll(regularChildSuperPackages);
                        pkg.setSubpackages(subSuperPackages);
                    }
                }
                if (!errors.hasErrors())
                    SNDService.get().savePackage(getViewContext().getContainer(), getUser(), pkg, superPackage, cloneFlag);
            }

            return new ApiSimpleResponse();
        }

        private class SuperPackageInfo
        {
            int _sortOrder;
            boolean _required;

            SuperPackageInfo()
            {
            }

            public int getSortOrder()
            {
                return _sortOrder;
            }

            public void setSortOrder(int sortOrder)
            {
                _sortOrder = sortOrder;
            }

            public boolean getRequired()
            {
                return _required;
            }

            public void setRequired(boolean required)
            {
                _required = required;
            }
        }

        private void setAdditionalSuperPackageInfo(LinkedList<SuperPackageInfo> superPackageInfos, SuperPackage superPackage)
        {
            // pick one of the additional infos for this super package ID
            SuperPackageInfo superPackageInfo = superPackageInfos.getFirst();

            // set it in the super package
            superPackage.setSortOrder(superPackageInfo.getSortOrder());
            superPackage.setRequired(superPackageInfo.getRequired());

            // remove this additional info so we don't use it again (only really useful when there are multiples)
            superPackageInfos.removeFirst();
        }
    }

    @RequiresPermission(SNDPackageViewerPermission.class)
    public class GetPackagesAction extends ReadOnlyApiAction<SimpleApiJsonForm>
    {
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            JSONArray pkgIds = json.has("packages") ? json.getJSONArray("packages") : null;
            if (pkgIds == null)
            {
                errors.reject(ERROR_MSG, "Package IDs not defined.");
            }
            else
            {
                for (int j = 0; j < pkgIds.length(); j++)
                {
                    try
                    {
                        pkgIds.getInt(j);  // just trying to parse as int
                    }
                    catch (Exception e)
                    {
                        errors.reject(ERROR_MSG, "Package IDs are present but not valid integers.");
                    }
                }
            }
        }

        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();
            JSONArray pkgIds = json.getJSONArray("packages");
            boolean includeExtraFields = !json.has("excludeExtraFields") || !json.getBoolean("excludeExtraFields");
            boolean includeLookups = !json.has("excludeLookups") || !json.getBoolean("excludeLookups");
            boolean includeFullSubpackages = json.has("includeFullSubpackages") && json.getBoolean("includeFullSubpackages");
            ApiSimpleResponse response = new ApiSimpleResponse();

            List<Package> pkgs = new ArrayList<>();
            List<Integer> ids = new ArrayList<>();

            // Query on new form to get form metadata
            if (pkgIds.getInt(0) == -1)
            {
                Package newPkg = new Package();
                newPkg = SNDManager.get().addExtraFieldsToPackage(getViewContext().getContainer(), getUser(), newPkg, null);
                newPkg = SNDManager.get().addLookupsToPkg(getViewContext().getContainer(), getUser(), newPkg);
                pkgs.add(newPkg);
            }
            else // Existing pkg
            {
                int id;
                for (int j = 0; j < pkgIds.length(); j++)
                {
                    id = pkgIds.getInt(j);
                    if (id > -1)
                        ids.add(id);
                }

                SNDService sndService = SNDService.get();
                if (ids.size() > 0 && sndService != null)
                {
                    pkgs.addAll(sndService.getPackages(getViewContext().getContainer(), getUser(), ids,
                            includeExtraFields, includeLookups, includeFullSubpackages));
                }
            }

            JSONArray jsonOut = new JSONArray();
            JSONObject jsonObj;
            for (Package pkg : pkgs)
            {
                jsonObj = pkg.toJSON(getViewContext().getContainer(), getUser());
                jsonOut.put(jsonObj);
            }

            response.put("json", jsonOut);
            return response;
        }
    }

    @RequiresPermission(SNDProjectEditorPermission.class)
    public class SaveProjectAction extends MutatingApiAction<SimpleApiJsonForm>
    {

        public static final String dateFormat = "yyyy-MM-dd";

        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            if (!json.has("description") || json.getString("description") == null)
            {
                errors.reject(ERROR_MSG, "Missing description.");
            }

            if (!json.has("active"))
            {
                errors.reject(ERROR_MSG, "Missing active.");
            }

            if (!json.has("referenceId"))
            {
                errors.reject(ERROR_MSG, "Missing referenceId.");
            }

            if (!json.has("startDate") || json.getString("startDate") == null || json.getString("startDate").equals(""))
            {
                errors.reject(ERROR_MSG, "Missing startDate.");
            }

            if (!json.has("isEdit"))
            {
                json.put("isEdit", false);
            }

            if (!json.has("isRevision"))
            {
                json.put("isRevision", false);

            }

            if (json.getBoolean("isEdit") && json.getBoolean("isRevision"))
            {
                errors.reject(ERROR_MSG, "isEdit and isRevision cannot both be true.");
            }

            if (json.getBoolean("isEdit"))
            {
                if (!json.has("projectId") || json.getInt("projectId") < 0)
                {
                    errors.reject(ERROR_MSG, "Must provide valid project id when isEdit is true.");
                }
                else
                {
                    if (!json.has("revisionNum") || json.getInt("projectId") < 0)
                    {
                        errors.reject(ERROR_MSG, "Must provide valid revision number when isEdit is true.");
                    }
                }
            }

            if (json.getBoolean("isRevision"))
            {
                if (!json.has("projectId") || json.getInt("projectId") < 0)
                {
                    errors.reject(ERROR_MSG, "Must provide valid project id when isRevision is true.");
                }
                else
                {
                    if (!json.has("revisionNum") || json.getInt("projectId") < 0)
                    {
                        errors.reject(ERROR_MSG, "Must provide valid revision number when isRevision is true.");
                    }
                }
            }

            if (json.has("endDate") && (json.isNull("endDate") || json.getString("endDate").equals("")))
            {
                json.remove("endDate");
            }

            if (json.has("endDate") && !json.isNull("endDate"))
            {
                SimpleDateFormat formatter = new SimpleDateFormat(dateFormat);
                try
                {
                    Date start = formatter.parse(json.getString("startDate"));
                    Date end = formatter.parse(json.getString("endDate"));

                    if (end.before(start))
                        errors.reject(ERROR_MSG, "End date must not be before start date.");
                }
                catch (ParseException e)
                {
                    errors.reject(ERROR_MSG, e.getMessage());
                }
            }

            form.bindJson(json);
        }

        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors) throws Exception
        {
            JSONObject json = form.getJsonObject();

            int id = json.optInt("projectId", -1);
            Project project = new Project(id, json.optInt("revisionNum", 0), json.getBoolean("isEdit"),
                    json.getBoolean("isRevision"), getViewContext().getContainer());

            project.setDescription(json.getString("description"));
            project.setActive(json.getBoolean("active"));
            project.setReferenceId(json.getInt("referenceId"));

            SimpleDateFormat formatter = new SimpleDateFormat(dateFormat);
            if (json.getBoolean("isRevision"))
            {
                project.setCopyRevisedPkgs(json.getBoolean("copyRevisedPkgs"));
                if (json.has("endDateRevised") && json.getString("endDateRevised") != null)
                {
                    project.setEndDateRevised(formatter.parse(json.getString("endDateRevised")));
                }
                else
                {
                    project.setEndDateRevised(null);
                }
            }

            project.setStartDate(formatter.parse(json.getString("startDate")));
            if (json.has("endDate") && json.getString("endDate") != null)
                project.setEndDate(formatter.parse(json.getString("endDate")));
            else
                project.setEndDate(null);

            // Get extra fields
            JSONArray jsonExtras = json.optJSONArray("extraFields");
            if (null != jsonExtras)
            {
                project.setExtraFields(getExtraFields(jsonExtras));
            }

            // Parse project items. Not done for revision
            JSONArray jsonPkgs = json.optJSONArray("projectItems");
            if (null != jsonPkgs && !json.getBoolean("isRevision"))
            {
                List<ProjectItem> projectItems = new ArrayList<>();
                JSONObject jsonItem;
                ProjectItem projectItem;
                Object superPkgId;
                for (int i = 0; i < jsonPkgs.length(); i++)
                {
                    jsonItem = jsonPkgs.getJSONObject(i);
                    projectItem = new ProjectItem();
                    projectItem.setActive(jsonItem.getBoolean("active"));
                    superPkgId = jsonItem.get("superPkgId");

                    if (superPkgId == null)
                    {
                        errors.reject(ERROR_MSG, "Project item missing super package id.");
                    }
                    else
                    {
                        projectItem.setSuperPkgId((Integer) superPkgId);
                        projectItem.setParentObjectId(project.getObjectId());
                        projectItem.setProjectItemId(jsonItem.has(ProjectItem.PROJECTITEM_ID) && !jsonItem.isNull(ProjectItem.PROJECTITEM_ID)
                                ? jsonItem.getInt(ProjectItem.PROJECTITEM_ID) : -1);
                        projectItem.setContainer(getViewContext().getContainer().getId());
                        //projectItem.setProjectItemId(jsonItem.getInt(ProjectItem.PROJECTITEM_ID));
                        projectItems.add(projectItem);
                    }
                }
                project.setProjectItems(projectItems);
            }

            if (!errors.hasErrors())
                SNDService.get().saveProject(getViewContext().getContainer(), getUser(), project, json.getBoolean("isRevision"));

            return new ApiSimpleResponse();
        }
    }

    @RequiresPermission(SNDProjectViewerPermission.class)
    public class GetProjectAction extends ReadOnlyApiAction<SimpleApiJsonForm>
    {
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            if (!json.has("projectId") || json.get("projectId") == null)
            {
                errors.reject(ERROR_MSG, "Missing required json parameter: projectId.");
            }

            if (!json.has("revisionNum") || json.get("revisionNum") == null)
            {
                errors.reject(ERROR_MSG, "Missing required json parameter: revisionNum.");
            }
        }

        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();
            ApiSimpleResponse response = new ApiSimpleResponse();

            int projectId = json.getInt("projectId");
            int revisionNum = json.getInt("revisionNum");

            Project project;

            // Query on new form to get form metadata
            if (projectId == -1)
            {
                project = new Project();
                project = SNDManager.get().addExtraFieldsToProject(getViewContext().getContainer(), getUser(), project, null);
            }
            else // Existing project
            {
                project = SNDService.get().getProject(getViewContext().getContainer(), getUser(), projectId, revisionNum);
            }

            if (project != null)
            {
                response.put("json", project.toJSON(getViewContext().getContainer(), getUser()));
            }

            return response;

        }
    }

    @RequiresPermission(ReadPermission.class)
    public class GetEventAction extends ReadOnlyApiAction<SimpleApiJsonForm>
    {
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            if (!json.has("eventId") || json.get("eventId") == null)
            {
                errors.reject(ERROR_MSG, "Missing required json parameter: eventId.");
            }
            else
            {
                try
                {
                    json.getInt("eventId");  // just trying to parse as int
                }
                catch (Exception e)
                {
                    errors.reject(ERROR_MSG, "eventId is present but not a valid integer.");
                }
            }

        }

        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors)
        {
            ApiSimpleResponse response = new ApiSimpleResponse();
            JSONObject json = form.getJsonObject();

            int eventId = json.getInt("eventId");
            boolean getTextNarrative = json.optBoolean("getTextNarrative");
            boolean getRedactedTextNarrative = json.optBoolean("getRedactedTextNarrative");
            boolean getHtmlNarrative = json.optBoolean("getHtmlNarrative");
            boolean getRedactedHtmlNarrative = json.optBoolean("getRedactedHtmlNarrative");

            Set<EventNarrativeOption> narrativeOptions = new HashSet<>();
            if (getTextNarrative)
                narrativeOptions.add(EventNarrativeOption.TEXT_NARRATIVE);
            if (getRedactedTextNarrative)
                narrativeOptions.add(EventNarrativeOption.REDACTED_TEXT_NARRATIVE);
            if (getHtmlNarrative)
                narrativeOptions.add(EventNarrativeOption.HTML_NARRATIVE);
            if (getRedactedHtmlNarrative)
                narrativeOptions.add(EventNarrativeOption.REDACTED_HTML_NARRATIVE);

            Event event;

            // Query on new form to get form metadata
            if (eventId == -1)
            {
                event = SNDManager.get().getEmptyEvent(getContainer(), getUser());
            }
            else
            {
                event = SNDService.get().getEvent(getContainer(), getUser(), json.getInt("eventId"), narrativeOptions);
            }
            if (event != null)
            {
                if (event.hasErrors())
                {
                    response.put("success", false);
                }
                else
                {
                    response.put("success", true);
                }
                JSONObject eventJson = event.toJSON(getViewContext().getContainer(), getUser());
                response.put("event", eventJson);
            }
            else
            {
                response.put("json", "Event not found.");
            }
            return response;
        }
    }

    @RequiresPermission(InsertPermission.class)
    public class SaveEventAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public void validateForm(SimpleApiJsonForm form, Errors errors)
        {
            JSONObject json = form.getJsonObject();
            if (json == null)
            {
                errors.reject(ERROR_MSG, "Missing json parameter.");
                return;
            }

            if (json.has("eventId"))
            {
                try
                {
                    json.getInt("eventId");  // just trying to parse as int
                }
                catch (Exception e)
                {
                    errors.reject(ERROR_MSG, "eventId is present but not a valid integer.");
                }
            }

            if (!json.has("subjectId") || json.get("subjectId") == null)
            {
                errors.reject(ERROR_MSG, "Missing required json parameter: subjectId.");
            }
            if (!json.has("projectIdRev") || json.get("projectIdRev") == null)
            {
                errors.reject(ERROR_MSG, "Missing required json parameter: projectIdRev.");
            }
            if (!json.has("qcState") || json.get("qcState") == null || !json.get("qcState").getClass().getSimpleName().equals("String"))
            {
                errors.reject(ERROR_MSG, "QCState not found.");
            }

            JSONArray eventDataJson = json.has("eventData") ? json.getJSONArray("eventData") : null;
            validateEventData(eventDataJson, false, errors);
        }

        private void validateEventData(JSONArray eventDataJson, boolean subPkg, Errors errors)
        {
            String msgAppend = (subPkg ? " for a subPackage" : " for a top level package");

            if (eventDataJson != null)
            {
                for (int i = 0; i < eventDataJson.length(); i++)
                {
                    JSONObject eventDatumJson = (JSONObject) eventDataJson.get(i);

                    if (eventDatumJson.has("eventDataId"))
                    {
                        try
                        {
                            eventDatumJson.getInt("eventDataId");  // just trying to parse as int
                        }
                        catch (Exception e)
                        {
                            errors.reject(ERROR_MSG, "eventDataId is present but not a valid integer" + msgAppend);
                        }
                    }

                    if (!eventDatumJson.has("superPkgId") || eventDatumJson.get("superPkgId") == null)
                    {
                        errors.reject(ERROR_MSG, "Missing required json parameter: superPkgId" + msgAppend);
                    }

                    JSONArray eventDataChildrenJson = eventDatumJson.has("subPackages") ? eventDatumJson.getJSONArray("subPackages") : null;
                    validateEventData(eventDataChildrenJson, true, errors);
                    JSONArray attributesJson = eventDatumJson.has("attributes") ? eventDatumJson.getJSONArray("attributes") : null;
                    if ((attributesJson == null))
                    {
                        errors.reject(ERROR_MSG, "Missing json parameter: attributes" + msgAppend);
                    }
                    validateAttributes(attributesJson, errors);
                }
            }
        }

        private void validateAttributes(JSONArray attributesDataJson, Errors errors)
        {
            if (attributesDataJson != null)
            {
                for (int i = 0; i < attributesDataJson.length(); i++)
                {
                    JSONObject attributeJson = (JSONObject) attributesDataJson.get(i);

                    if ((!attributeJson.has("propertyId") || attributeJson.get("propertyId") == null)
                            && (!attributeJson.has("propertyName") || attributeJson.get("propertyName") == null))
                    {
                        errors.reject(ERROR_MSG, "Missing required json parameter: propertyId or propertyName.");
                    }
                    if (!attributeJson.has("value") || attributeJson.get("value") == null)
                    {
                        errors.reject(ERROR_MSG, "Missing required json parameter: value.");
                    }
                }
            }
        }

        @Override
        public ApiResponse execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();
            Integer eventId = json.has("eventId") ? json.getInt("eventId") : null;
            String subjectId = json.getString("subjectId");
            String dateString = json.optString("date", null);
            Boolean validateOnly = json.optBoolean("validateOnly");
            String qcStateString = json.getString("qcState");
            int qcState = SNDService.get().getQCStateId(getContainer(), getUser(), QCStateEnum.getByName(qcStateString));
            String objectId = json.has("objectId") ? json.getString("objectId") : GUID.makeGUID();
            ApiSimpleResponse response = new ApiSimpleResponse();

            if (validateOnly == null)
            {
                validateOnly = false;
            }

            Date date = null;
            try
            {
                date = (dateString == null ? new Date() : DateUtil.parseDateTime(dateString, Event.DATE_TIME_FORMAT));
            }
            catch (ParseException e)
            {
                errors.reject(ERROR_MSG, e.getMessage());
            }

            if (!errors.hasErrors())
            {
                String projectIdrev = json.getString("projectIdRev");
                String note = json.has("note") ? json.getString("note") : null;

                List<EventData> eventData = null;
                JSONArray eventDataJson = json.has("eventData") ? json.getJSONArray("eventData") : null;
                if (eventDataJson != null)
                {
                    try
                    {
                        eventData = parseEventData(eventDataJson);
                    }
                    catch (IOException e)
                    {
                        errors.reject(ERROR_MSG, "Event JSON data could not be parsed: " + e.getMessage());
                    }
                }

                Event event = new Event(eventId, subjectId, date, projectIdrev, note, eventData, getContainer(), objectId);
                event.setQcState(qcState);

                // Get extra fields
                JSONArray jsonExtras = json.optJSONArray("extraFields");
                if (null != jsonExtras)
                {
                    try
                    {
                        event.setExtraFields(getExtraFields(jsonExtras));
                    }
                    catch (IOException e)
                    {
                        errors.reject(ERROR_MSG, "Unable to parse extra fields: " + e.getMessage());
                    }
                }

                Event savedEvent = SNDService.get().saveEvent(getContainer(), getUser(), event, validateOnly);

                if (savedEvent != null) {
                    response.put("event", savedEvent.toJSON(getContainer(), getUser()));
                    if (savedEvent.hasErrors())
                    {
                        response.put("success", false);
                    }
                    else
                    {
                        response.put("success", true);
                    }
                } else {
                    response.put("event", null);
                    response.put("success", true);
                }
            }
            return response;
        }

        private List<EventData> parseEventData(JSONArray eventDataJson) throws IOException
        {
            List<EventData> eventDataList = new ArrayList<>();

            if ((eventDataJson != null) && (eventDataJson.length() > 0))
            {
                for (int i = 0; i < eventDataJson.length(); i++)
                {
                    JSONObject eventDatumJson = (JSONObject) eventDataJson.get(i);

                    Integer eventDataId = eventDatumJson.has(EventData.EVENT_DATA_ID) ? eventDatumJson.getInt(EventData.EVENT_DATA_ID) : null;
                    Integer sortOrder = eventDatumJson.has(EventData.EVENT_DATA_SORT_ORDER) ? eventDatumJson.getInt(EventData.EVENT_DATA_SORT_ORDER) : null;
                    int superPackageId;
                    try
                    {
                        superPackageId = eventDatumJson.getInt(EventData.EVENT_DATA_SUPER_PACKAGE_ID);
                    }
                    catch (Exception e)
                    {
                        throw new IOException("eventDataId " + (eventDataId == null ? 0 : eventDataId) + " is missing required json parameter: superPackageId");
                    }

                    List<EventData> eventDataChildren;
                    JSONArray eventDataChildrenJson = eventDatumJson.has(EventData.EVENT_DATA_SUB_PACKAGES) ? eventDatumJson.getJSONArray(EventData.EVENT_DATA_SUB_PACKAGES) : null;
                    eventDataChildren = parseEventData(eventDataChildrenJson);

                    List<AttributeData> attributes;
                    JSONArray attributesJson = eventDatumJson.has(EventData.EVENT_DATA_ATTRIBUTES) ? eventDatumJson.getJSONArray(EventData.EVENT_DATA_ATTRIBUTES) : null;
                    attributes = parseAttributeData(attributesJson);

                    EventData eventData = new EventData(eventDataId, superPackageId, null, eventDataChildren, attributes, sortOrder);

                    // Get extra fields
                    JSONArray jsonExtras = eventDatumJson.optJSONArray(EventData.EVENT_DATA_EXTRA_FIELDS);
                    if (null != jsonExtras)
                    {
                        eventData.setExtraFields(getExtraFields(jsonExtras));
                    }

                    // narrative not used for saving, so make it null
                    eventDataList.add(eventData);
                }
            }

            if (!eventDataList.isEmpty())
                return eventDataList;
            else
                return null;
        }

        private List<AttributeData> parseAttributeData(JSONArray attributesDataJson)
        {
            List<AttributeData> attributesDataList = new ArrayList<>();

            if ((attributesDataJson != null) && (attributesDataJson.length() > 0))
            {
                String propertyName = null;
                int propertyId = -1;

                for (int i = 0; i < attributesDataJson.length(); i++)
                {
                    JSONObject attributeJson = (JSONObject) attributesDataJson.get(i);

                    if (attributeJson.has("propertyName"))
                    {
                        propertyName = (String) attributeJson.get("propertyName");
                    }
                    else
                    {
                        propertyId = attributeJson.optInt("propertyId");
                    }
                    String value = attributeJson.optString("value");

                    // propertyDescriptor not used for saving, so make it null
                    if (propertyName != null)
                    {
                        attributesDataList.add(new AttributeData(propertyName, null, value));
                    }
                    else if (propertyId != -1)
                    {
                        attributesDataList.add(new AttributeData(propertyId, null, value));
                    }
                }
            }

            if (!attributesDataList.isEmpty())
                return attributesDataList;
            else
                return null;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class RegisterTestTriggerFactoryAction extends ReadOnlyApiAction<SimpleApiJsonForm>
    {
        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();
            boolean unregister = (json != null && json.has("unregister") && json.getBoolean("unregister"));

            Module sndModule = null;
            for (Module module : getViewContext().getContainer().getActiveModules())
            {
                if (module.getName().equals("SND"))
                {
                    sndModule = module;
                    break;
                }
            }

            if (sndModule != null)
            {
                if (unregister)
                {
                    SNDService.get().unregisterEventTriggerFactory(sndModule);
                }
                else
                {
                    SNDService.get().registerEventTriggerFactory(sndModule, new SNDTestEventTriggerFactory());
                }
            }
            else
            {
                errors.reject("SND module not enabled");
            }

            return new ApiSimpleResponse();
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class ClearNarrativeCacheAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors)
        {
            SNDService.get().clearNarrativeCache(getContainer(), getUser());
            return new ApiSimpleResponse();
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class FillInNarrativeCacheAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors)
        {
            SNDService.get().fillInNarrativeCache(getContainer(), getUser(), null);
            return new ApiSimpleResponse();
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class PopulateQCStatesAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors)
        {
            SNDSecurityManager.get().populateQCStates(getContainer(), getUser());

            return new ApiSimpleResponse();
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class SecurityAction extends SimpleViewAction
    {

        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView<>("/org/labkey/snd/security/view/categorySecurity.jsp");
        }

        @Override
        public void addNavTrail(NavTree root)
        {
            ActionURL url = new ActionURL(true);
            url.setPath("snd-admin.view");
            url.setContainer(getContainer());
            root.addChild("Admin Settings", url);
            root.addChild("Security");
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class CategorySecurityAction extends FormHandlerAction
    {

        @Override
        public void validateCommand(Object target, Errors errors)
        {

        }

        @Override
        public boolean handlePost(Object o, BindException errors)
        {
            Map props = getViewContext().getExtendedProperties();
            SNDSecurityManager.get().updatePermissions(getContainer(), getUser(), props);
            return true;
        }

        @Override
        public URLHelper getSuccessURL(Object o)
        {
            return new ActionURL(SecurityAction.class, getContainer());
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class AdminAction extends SimpleViewAction
    {

        @Override
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView<>("/org/labkey/snd/view/sndAdmin.jsp");
        }

        @Override
        public void addNavTrail(NavTree root)
        {
            ActionURL url = new ActionURL(true);
            url.setPath("snd-app.view");
            url.setContainer(getContainer());
            root.addChild("SND Home Page", url);
            root.addChild("SND Admin Settings and Controls");
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class UpdateRoleAction extends MutatingApiAction<SimpleApiJsonForm>
    {
        @Override
        public Object execute(SimpleApiJsonForm form, BindException errors)
        {
            JSONObject json = form.getJsonObject();
            int categoryId = json.getInt("categoryId");
            String groupName = json.getString("groupName");
            String roleName = json.getString("roleName");

            SNDSecurityManager.get().updatePermission(getContainer(), getUser(), categoryId, groupName, roleName);

            return new ApiSimpleResponse();
        }
    }
}