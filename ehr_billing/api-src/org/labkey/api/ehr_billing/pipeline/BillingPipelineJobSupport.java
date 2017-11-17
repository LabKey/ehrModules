package org.labkey.api.ehr_billing.pipeline;

import java.io.File;
import java.util.Date;

public interface BillingPipelineJobSupport
{
    public Date getStartDate();

    public Date getEndDate();

    public String getComment();

    public String getName();

    public File getAnalysisDir();
}