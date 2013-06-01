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
package org.labkey.ehr.utils;

import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.query.FieldKey;
import org.labkey.ehr.EHRSchema;

import java.util.Map;

/**
 * User: bimber
 * Date: 9/17/12
 * Time: 1:58 PM
 */
public class FormContext
{
    String _name;
    String _categoryl;
    String _description;
    String _configjson;
    Boolean _permitsSingleIdOnly;
    FormPanelSection[] _sections;

    public FormContext(String name)
    {
        _name = name;

    }

    private void queryData()
    {
        TableInfo formTypes = EHRSchema.getInstance().getSchema().getTable(EHRSchema.TABLE_FORMTYPES);
        SimpleFilter filter = new SimpleFilter(FieldKey.fromString("formtype"), _name);
        TableSelector ts1 = new TableSelector(formTypes, filter, null);

        Map[] rows = ts1.getArray(Map.class);
        if (rows.length != 1)
            throw new IllegalArgumentException("Improper data in formTypes table for form: " + _name);

        Map<String, Object> row = rows[0];


        TableInfo formPanelSections = EHRSchema.getInstance().getSchema().getTable(EHRSchema.TABLE_FORMPANELSECTIONS);

        TableSelector ts2 = new TableSelector(formTypes, filter, null);
        ts2.getArray(FormPanelSection.class);

    }

    public String getName()
    {
        return _name;
    }

    public void setName(String name)
    {
        _name = name;
    }

    public String getCategoryl()
    {
        return _categoryl;
    }

    public void setCategoryl(String categoryl)
    {
        _categoryl = categoryl;
    }

    public String getDescription()
    {
        return _description;
    }

    public void setDescription(String description)
    {
        _description = description;
    }

    public String getConfigjson()
    {
        return _configjson;
    }

    public void setConfigjson(String configjson)
    {
        _configjson = configjson;
    }

    public Boolean getPermitsSingleIdOnly()
    {
        return _permitsSingleIdOnly;
    }

    public void setPermitsSingleIdOnly(Boolean permitsSingleIdOnly)
    {
        _permitsSingleIdOnly = permitsSingleIdOnly;
    }

    public FormPanelSection[] getSections()
    {
        return _sections;
    }

    public static class FormPanelSection
    {
        private String _destination;
        private Integer _sort_order;
        private String _xtype;
        private String _schemaName;
        private String _queryName;
        private String _title;
        private String _configJson;

        public String getDestination()
        {
            return _destination;
        }

        public void setDestination(String destination)
        {
            _destination = destination;
        }

        public Integer getSort_order()
        {
            return _sort_order;
        }

        public void setSort_order(Integer sort_order)
        {
            _sort_order = sort_order;
        }

        public String getXtype()
        {
            return _xtype;
        }

        public void setXtype(String xtype)
        {
            _xtype = xtype;
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

        public String getTitle()
        {
            return _title;
        }

        public void setTitle(String title)
        {
            _title = title;
        }

        public String getConfigJson()
        {
            return _configJson;
        }

        public void setConfigJson(String configJson)
        {
            _configJson = configJson;
        }
    }
}
