package org.labkey.test.tests.onprc_ehr;

import org.junit.experimental.categories.Category;
import org.labkey.test.categories.CustomModules;
import org.labkey.test.categories.EHR;
import org.labkey.test.categories.ONPRC;
import org.labkey.test.tests.ehr.ComplianceTrainingTest;
import org.labkey.test.util.SqlserverOnlyTest;

@Category({CustomModules.class, EHR.class, ONPRC.class})
public class ONPRCComplianceTrainingTest extends ComplianceTrainingTest implements SqlserverOnlyTest
{

}
