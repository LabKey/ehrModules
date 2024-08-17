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

import org.labkey.api.action.FormViewAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.data.PropertyManager;
import org.labkey.api.exp.api.ExpSampleType;
import org.labkey.api.exp.api.SampleTypeService;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.util.URLHelper;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.validation.Errors;
import org.springframework.web.servlet.ModelAndView;

import java.util.Arrays;
import java.util.List;

public class EHR_SMController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(EHR_SMController.class);
    public static final String NAME = "ehr_sm";

    public EHR_SMController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            JspView<Void> view = new JspView<>("/org/labkey/ehr_sm/view/hello.jsp");
            view.setTitle("EHR Sample Manager");
            return view;
        }

        public void addNavTrail(NavTree root) { }
    }

    public static class AdminForm
    {
        private String sampleReceivedCol;
        private List<? extends ExpSampleType> animalSampleTypes;
        private String[] selectedAnimalSampleTypes;

        public String getSampleReceivedCol()
        {
            return sampleReceivedCol;
        }

        public void setSampleReceivedCol(String sampleReceivedCol)
        {
            this.sampleReceivedCol = sampleReceivedCol;
        }

        public List<? extends ExpSampleType> getAnimalSampleTypes()
        {
            return animalSampleTypes;
        }

        public void setAnimalSampleTypes(List<? extends ExpSampleType> animalSampleTypes)
        {
            this.animalSampleTypes = animalSampleTypes;
        }

        public String[] getSelectedAnimalSampleTypes()
        {
            return selectedAnimalSampleTypes;
        }

        public void setSelectedAnimalSampleTypes(String[] selectedAnimalSampleTypes)
        {
            this.selectedAnimalSampleTypes = selectedAnimalSampleTypes;
        }
    }

    @RequiresPermission(AdminPermission.class)
    public class AdminAction extends FormViewAction<AdminForm>
    {
        public void addNavTrail(NavTree root) { }

        @Override
        public void validateCommand(AdminForm target, Errors errors)
        {

        }

        @Override
        public ModelAndView getView(AdminForm adminForm, boolean reshow, BindException errors) throws Exception
        {
            PropertyManager.PropertyMap props = PropertyManager.getProperties(getContainer(), EHR_SMManager.ANIMAL_SAMPLE_PROP_SET_NAME);
            adminForm.setSelectedAnimalSampleTypes(props.keySet().toArray(new String[0]));
            adminForm.setAnimalSampleTypes(SampleTypeService.get().getSampleTypes(getContainer(), getUser(), true));
            adminForm.setSampleReceivedCol(props.get(EHR_SMManager.ANIMAL_SAMPLE_RECEIVED_PROP));

            JspView<AdminForm> view = new JspView<>("/org/labkey/ehr_sm/view/admin.jsp", adminForm, errors);
            view.setTitle("EHR Sample Manager Admin");

            return view;
        }

        @Override
        public boolean handlePost(AdminForm adminForm, BindException errors)
        {
            PropertyManager.PropertyMap props = PropertyManager.getWritableProperties(getContainer(), EHR_SMManager.ANIMAL_SAMPLE_PROP_SET_NAME, true);
            for (ExpSampleType animalSampleType : SampleTypeService.get().getSampleTypes(getContainer(), getUser(), true))
            {
                if (Arrays.stream(adminForm.getSelectedAnimalSampleTypes()).anyMatch(s -> s.equals(animalSampleType.getName())))
                {
                    props.put(animalSampleType.getName(), "true");
                }
                else
                {
                    props.remove(animalSampleType.getName());
                }
            }
            props.put(EHR_SMManager.ANIMAL_SAMPLE_RECEIVED_PROP, adminForm.getSampleReceivedCol());
            props.save();

            return true;
        }

        @Override
        public URLHelper getSuccessURL(AdminForm adminForm)
        {
            return new ActionURL(BeginAction.class, getContainer());
        }
    }
}
