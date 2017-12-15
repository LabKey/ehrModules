/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

CREATE INDEX IX_completiondates_employeeid ON ehr_compliancedb.completiondates(employeeid);
CREATE INDEX IX_completiondates_requirementname ON ehr_compliancedb.completiondates(requirementname);

CREATE INDEX IX_employeerequirementexemptions_employeeid ON ehr_compliancedb.employeerequirementexemptions(employeeid);
CREATE INDEX IX_employeerequirementexemptions_requirementname ON ehr_compliancedb.employeerequirementexemptions(requirementname);

CREATE INDEX IX_requirementspercategory_requirementname ON ehr_compliancedb.requirementspercategory(requirementname);

CREATE INDEX IX_requirementsperemployee_requirementname ON ehr_compliancedb.requirementsperemployee(requirementname);
CREATE INDEX IX_requirementsperemployee_employeeid ON ehr_compliancedb.requirementsperemployee(employeeid);

CREATE INDEX IX_sopdates_employeeid ON ehr_compliancedb.sopdates(employeeid);
