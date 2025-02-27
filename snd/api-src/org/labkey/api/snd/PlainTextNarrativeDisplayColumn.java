/*
 * Copyright (c) 2018 LabKey Corporation
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
package org.labkey.api.snd;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.RenderContext;
import org.labkey.api.util.HtmlString;

public class PlainTextNarrativeDisplayColumn extends DataColumn
{
    public PlainTextNarrativeDisplayColumn(ColumnInfo col)
    {
        super(col);
    }

    @Override
    public HtmlString getFormattedHtml(RenderContext ctx)
    {
        String htmlNarrative = (String)ctx.get(getColumnInfo().getFieldKey());
        return HtmlString.of(removeHtmlTagsFromNarrative(htmlNarrative));
    }

    @Override
    public Object getDisplayValue(RenderContext ctx)
    {
        String htmlNarrative = (String)ctx.get(getColumnInfo().getFieldKey());
        return removeHtmlTagsFromNarrative(htmlNarrative);
    }

    public static String removeHtmlTagsFromNarrative(String htmlNarrative)
   {
       String textNarrative;

       if (htmlNarrative != null && !htmlNarrative.isEmpty())
       {
           // first crudely change these three tags to newlines
           textNarrative = htmlNarrative.replace("<br>", "\n");
           textNarrative = textNarrative.replace("<div class='" + EventData.EVENT_DATA_CSS_CLASS +  "'>", "\n");
           textNarrative = textNarrative.replace("<div class='" + Event.SND_EVENT_SUBJECT_CSS_CLASS + "'>", "\n");
           textNarrative = textNarrative.replace("&emsp;", "\s\s\s\s");
           // then crudely remove all other HTML open/close tags, or things that look like them
           textNarrative = textNarrative.replaceAll("\\<.*?\\>", "");
       }
       else
           textNarrative = "";

       return textNarrative;
   }
}
