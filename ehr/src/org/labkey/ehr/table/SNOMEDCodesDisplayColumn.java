/*
 * Copyright (c) 2014-2019 LabKey Corporation
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
package org.labkey.ehr.table;

import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.collections.LabKeyCollectors;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.query.FieldKey;
import org.labkey.api.util.HtmlString;
import org.labkey.api.util.HtmlStringBuilder;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.api.writer.HtmlWriter;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

public class SNOMEDCodesDisplayColumn extends DataColumn
{
    private static final Logger _log = LogManager.getLogger(SNOMEDCodesDisplayColumn.class);

    public SNOMEDCodesDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    @Override
    public void renderGridCellContents(RenderContext ctx, HtmlWriter out)
    {
        Object o = getValue(ctx);
        if (o != null)
        {
            String val = o.toString();
            String[] parts = val.split("\\n");
            Map<Integer, HtmlStringBuilder> ret = new TreeMap<>();
            for (String part : parts)
            {
                part = StringUtils.trimToEmpty(part);
                String[] tokens = part.split(": ");
                if (tokens.length == 2 && StringUtils.trimToNull(tokens[0]) != null)
                {
                    Integer sort = Integer.parseInt(tokens[0]);
                    if (ret.containsKey(sort))
                    {
                        Object objectid = ctx.get(FieldKey.fromString("objectid"));
                        _log.error("Duplicate sort for snomed: {}{}", sort, objectid == null ? "" : ".  objectid: " + objectid);
                        ret.get(sort).append(HtmlString.BR).append(part);
                    }
                    else
                    {
                        ret.put(sort, HtmlStringBuilder.of(part));
                    }
                }
                else
                {
                    _log.error("Invalid SNOMED string: {}", val);
                }
            }

            out.write(ret.values().stream()
                .map(HtmlStringBuilder::getHtmlString)
                .collect(LabKeyCollectors.joining(HtmlString.BR)));
        }
    }

    @Override
    public @NotNull Set<ClientDependency> getClientDependencies()
    {
        return Collections.singleton(ClientDependency.fromPath("ehr/ehr_api.lib.xml"));
    }
}
