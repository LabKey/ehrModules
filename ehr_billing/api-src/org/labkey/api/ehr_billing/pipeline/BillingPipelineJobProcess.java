package org.labkey.api.ehr_billing.pipeline;

import org.labkey.api.data.TableInfo;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        Map<String, Object> params = new HashMap<>();
        params.put("StartDate", support.getStartDate());
        params.put("EndDate", support.getEndDate());
        return params;
    }
}
