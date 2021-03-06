/*
 * Copyright (c) 2013-2019 LabKey Corporation
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
package org.labkey.ehr.utils;

import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.ehr.EHRQCState;

/**
 * Bean class for the EHR's additional metadata associated with QC states. Persisted in ehr.qcstatemetadata
 * User: bimber
 * Date: 9/17/12
 */
public class EHRQCStateImpl implements EHRQCState
{
    private int _rowId;
    private String _label;
    private String _containerId;
    private String _description;
    private Boolean _publicData;
    private Boolean _draftData;
    private Boolean _isDeleted;
    private Boolean _isRequest;
    private Boolean _allowFutureDates;

    @Override
    public int getRowId()
    {
        return _rowId;
    }

    public void setRowId(int rowId)
    {
        _rowId = rowId;
    }

    @Override
    public String getLabel()
    {
        return _label;
    }

    public void setLabel(String label)
    {
        _label = label;
    }

    @Override
    public Container getContainer()
    {
        return ContainerManager.getForId(_containerId);
    }

    public void setContainer(String containerId)
    {
        _containerId = containerId;
    }

    @Override
    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    @Override
    public Boolean isPublicData()
    {
        return _publicData;
    }

    public void setPublicData(Boolean publicData)
    {
        _publicData = publicData;
    }

    @Override
    public Boolean isDraftData()
    {
        return _draftData;
    }

    public void setDraftData(Boolean draftData)
    {
        _draftData = draftData;
    }

    @Override
    public Boolean isDeleted()
    {
        return _isDeleted;
    }

    public void setIsDeleted(Boolean deleted)
    {
        _isDeleted = deleted;
    }

    @Override
    public Boolean isRequest()
    {
        return _isRequest;
    }

    public void setIsRequest(Boolean request)
    {
        _isRequest = request;
    }

    @Override
    public Boolean isAllowFutureDates()
    {
        return _allowFutureDates;
    }

    public void setAllowFutureDates(Boolean allowFutureDates)
    {
        _allowFutureDates = allowFutureDates;
    }

    @Override
    public JSONObject toJson()
    {
        JSONObject json = new JSONObject();
        json.put("RowId", getRowId());
        json.put("Label", getLabel());
        json.put("PublicData", isPublicData());
        json.put("isRequest", isRequest());
        json.put("isDraftData", isDraftData());
        json.put("allowFutureDates", isAllowFutureDates());
        return json;
    }
}

