/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
package org.labkey.api.ehr.table;

import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.DataColumn;
import org.labkey.api.data.DisplayColumn;
import org.labkey.api.data.DisplayColumnFactory;
import org.labkey.api.data.RenderContext;
import org.labkey.api.ehr.security.EHRClinicalEntryPermission;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.UserSchema;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.LinkBuilder;
import org.labkey.api.view.ActionURL;
import org.labkey.api.writer.HtmlWriter;

import java.util.Date;
import java.util.Set;

/**
 * Renders a link from a treatment order row to the data entry form for that order.
 *
 * Use {@link #forSchedule} on tables whose date column is the scheduled slot being recorded (study.treatmentSchedule):
 * the row's date is passed as scheduledDate so each slot is recorded against its own time. Use {@link #forOrder} on
 * tables whose date column is the order's start date (study.treatment_order), where passing it as scheduledDate would
 * make every recording against the order look like the first one.
 */
public class TreatmentLinkDisplayColumnFactory implements DisplayColumnFactory
{
    private final TreatmentLinkConfig _config;
    private final boolean _includeScheduledDate;

    private TreatmentLinkDisplayColumnFactory(TreatmentLinkConfig config, boolean includeScheduledDate)
    {
        _config = config;
        _includeScheduledDate = includeScheduledDate;
    }

    /** For tables whose date is the treatment order's start date. Does not pass scheduledDate. */
    public static TreatmentLinkDisplayColumnFactory forOrder(TreatmentLinkConfig config)
    {
        return new TreatmentLinkDisplayColumnFactory(config, false);
    }

    /** For tables whose date is the scheduled slot being recorded. Passes that date as scheduledDate. */
    public static TreatmentLinkDisplayColumnFactory forSchedule(TreatmentLinkConfig config)
    {
        return new TreatmentLinkDisplayColumnFactory(config, true);
    }

    @Override
    public DisplayColumn createRenderer(final ColumnInfo colInfo)
    {
        return new DataColumn(colInfo)
        {
            @Override
            public void renderGridCellContents(RenderContext ctx, HtmlWriter out)
            {
                UserSchema schema = colInfo.getParentTable().getUserSchema();
                if (schema == null || !schema.getContainer().hasPermission(schema.getUser(), EHRClinicalEntryPermission.class))
                    return;

                String category = (String)ctx.get("category");
                if (category == null)
                    return;

                String objectid = (String)getBoundColumn().getValue(ctx);
                String caseid = (String)ctx.get("caseid");
                Date date = (Date)ctx.get("date");

                TreatmentLinkConfig.FormTypes formTypes = _config.getFormTypes(category);
                ActionURL url = new ActionURL("ehr", "dataEntryForm", schema.getContainer());
                if (caseid != null)
                {
                    url.addParameter("formType", formTypes.withCase());
                    url.addParameter("caseid", caseid);
                }
                else
                {
                    url.addParameter("formType", formTypes.withoutCase());
                }

                url.addParameter(_config.getOrderIdParam(), objectid);
                if (_includeScheduledDate && date != null)
                    url.addParameter("scheduledDate", DateUtil.formatIsoDateShortTime(date));

                String returnUrl = new ActionURL("ehr", "animalHistory", schema.getContainer())
                        + "#inputType:none&showReport:0&activeReport:" + _config.getReturnReport();
                url.addParameter("returnUrl", returnUrl);

                out.write(LinkBuilder.labkeyLink(_config.getLinkText(), url).target("_blank"));
            }

            @Override
            public void addQueryFieldKeys(Set<FieldKey> keys)
            {
                super.addQueryFieldKeys(keys);
                keys.add(getBoundColumn().getFieldKey());
                keys.add(FieldKey.fromString("date"));
                keys.add(FieldKey.fromString("caseid"));
                keys.add(FieldKey.fromString("category"));
            }

            @Override
            public boolean isSortable()
            {
                return false;
            }

            @Override
            public boolean isFilterable()
            {
                return false;
            }

            @Override
            public boolean isEditable()
            {
                return false;
            }
        };
    }
}
