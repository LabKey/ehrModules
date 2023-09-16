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
package org.labkey.api.ehr_billing.pipeline;

import org.labkey.api.data.TableInfo;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * One section of an EHR billing implementation that generates the line items of a particular type of charges,
 * like per-diems or blood draws.
 */
public class BillingPipelineJobProcess
{
    private String _label;
    private String _schemaName;
    private String _queryName;
    private Map<String, String> _queryToInvoiceItemColMap;
    private List<String> _requiredFields;
    private boolean _useEHRContainer = false;
    private boolean _isMiscCharges = false;
    private TableInfo _miscChargesTableInfo;
    private Map<String,Object> _params;

    /**
     *
     * @param label human-readable description for this source of charges
     * @param schemaName name of the schema that holds the query to be executed
     * @param queryName the name of the query that knows how to generate line items for the invoice
     * @param queryToInvoiceItemColMap mapping of column names from the query above to the column names in the ehr_billing.invoicedItems table
     */
    public BillingPipelineJobProcess(String label, String schemaName, String queryName, Map<String, String> queryToInvoiceItemColMap)
    {
        _label = label;
        _schemaName = schemaName;
        _queryName = queryName;
        _queryToInvoiceItemColMap = queryToInvoiceItemColMap;
    }

    public String getLabel()
    {
        return _label;
    }

    public void setLabel(String label)
    {
        _label = label;
    }

    public String getSchemaName()
    {
        return _schemaName;
    }

    public void setSchemaName(String schemaName)
    {
        _schemaName = schemaName;
    }

    public String getQueryName()
    {
        return _queryName;
    }

    public void setQueryName(String queryName)
    {
        _queryName = queryName;
    }

    public Map<String, String> getQueryToInvoiceItemColMap()
    {
        if (_queryToInvoiceItemColMap == null)
            return Collections.emptyMap();
        return _queryToInvoiceItemColMap;
    }

    public void setQueryToInvoiceItemColMap(Map<String, String> queryToInvoiceItemColMap)
    {
        _queryToInvoiceItemColMap = queryToInvoiceItemColMap;
    }

    public List<String> getRequiredFields()
    {
        if (_requiredFields == null)
            return Collections.emptyList();
        return _requiredFields;
    }

    public void setRequiredFields(List<String> requiredFields)
    {
        _requiredFields = requiredFields;
    }

    public boolean isUseEHRContainer()
    {
        return _useEHRContainer;
    }

    public void setUseEHRContainer(boolean useEHRContainer)
    {
        _useEHRContainer = useEHRContainer;
    }

    public boolean isMiscCharges()
    {
        return _isMiscCharges;
    }

    public TableInfo getMiscChargesTableInfo()
    {
        return _miscChargesTableInfo;
    }

    public void setMiscCharges(boolean miscCharges)
    {
        _isMiscCharges = miscCharges;
    }

    public void setMiscCharges(boolean miscCharges, TableInfo tableInfo)
    {
        _isMiscCharges = miscCharges;
        _miscChargesTableInfo = tableInfo;
    }

    public Map<String, Object> getQueryParams(BillingPipelineJobSupport support)
    {
        if (_params == null)
            _params = new HashMap<>();
        _params.put("StartDate", support.getStartDate());
        _params.put("EndDate", support.getEndDate());
        return _params;
    }

    public void addQueryParam(String name, Object value)
    {
        if (_params == null)
            _params = new HashMap<>();
        _params.put(name, value);
    }
}
