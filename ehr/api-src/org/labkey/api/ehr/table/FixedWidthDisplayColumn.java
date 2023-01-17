package org.labkey.api.ehr.table;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;

import java.io.IOException;
import java.io.Writer;

public class FixedWidthDisplayColumn extends DataColumn
{
    private int _maxWidth;

    public FixedWidthDisplayColumn(ColumnInfo col, int maxWidth)
    {
        super(col);
        _maxWidth = maxWidth;
    }

    @Override
    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
    {
        out.write("<div style=\"max-width:" + _maxWidth + ";\">");
        super.renderGridCellContents(ctx, out);
        out.write("</div>");
    }
}
