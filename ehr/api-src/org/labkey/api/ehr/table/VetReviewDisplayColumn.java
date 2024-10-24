package org.labkey.api.ehr.table;

import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.HttpView;
import org.labkey.api.view.template.ClientDependency;

import java.io.IOException;
import java.io.Writer;
import java.util.Collections;
import java.util.Set;

public class VetReviewDisplayColumn extends DataColumn
{
    private boolean _clickHandlerRegistered = false;

    public VetReviewDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    @Override
    public void renderGridCellContents(RenderContext ctx, Writer out) throws IOException
    {
        Object o = getValue(ctx);
        if (o != null)
        {
            String val = o.toString();
            String[] parts = val.split("<:>");
            String delim = "";
            for (String part : parts)
            {
                part = StringUtils.trimToNull(part);
                String[] tokens = part.split("<>");

                out.write(delim);
                delim = "<br><br>";
                //String key = StringUtils.trimToNull(tokens[0]);
                String text = StringUtils.trimToNull(tokens[1]);
                if (text != null)
                {
                    text = text.replaceAll("\\r?\\n", "<br>");
                    text = text.replaceAll("\\*\\*", "<span style=\"background-color: yellow;\">\\*\\*</span>");
                }

                out.write("<a style=\"max-width: 500px;\" class=\"labkey-text-link vrdc-row\" data-objectid=\"" + PageFlowUtil.filter(StringUtils.trimToNull(tokens[2])) + "\">");

                if (!_clickHandlerRegistered)
                {
                    HttpView.currentPageConfig().addHandlerForQuerySelector("a.vrdc-row", "click", "EHR.panel.ClinicalManagementPanel.replaceSoap({objectid: this.attributes.getNamedItem('data-objectid').value, scope: this, callback: function(){EHR.panel.ClinicalManagementPanel.updateVetColumn(this, arguments[0], arguments[1]);}});" );
                    _clickHandlerRegistered = true;
                }
                out.write(text);
                out.write("</a>");
            }
        }
    }

    @Override
    public @NotNull Set<ClientDependency> getClientDependencies()
    {
        return Collections.singleton(ClientDependency.fromPath("ehr/ehr_api.lib.xml"));
    }
}
