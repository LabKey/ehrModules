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
