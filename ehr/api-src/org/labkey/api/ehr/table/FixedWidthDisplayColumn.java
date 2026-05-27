/*
 * Copyright (c) 2023-2026 LabKey Corporation
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
package org.labkey.api.ehr.table;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.util.DOM;
import org.labkey.api.writer.HtmlWriter;

import static org.labkey.api.util.DOM.Attribute.style;
import static org.labkey.api.util.DOM.DIV;
import static org.labkey.api.util.DOM.at;

public class FixedWidthDisplayColumn extends DataColumn
{
    private final int _maxWidth;

    public FixedWidthDisplayColumn(ColumnInfo col, int maxWidth)
    {
        super(col);
        _maxWidth = maxWidth;
    }

    @Override
    public void renderGridCellContents(RenderContext ctx, HtmlWriter out)
    {
        DIV(
            at(style, "max-width:" + _maxWidth + ";"),
            (DOM.Renderable) ret -> {
                super.renderGridCellContents(ctx, out);
                return ret;
            }
        ).appendTo(out);
    }
}
