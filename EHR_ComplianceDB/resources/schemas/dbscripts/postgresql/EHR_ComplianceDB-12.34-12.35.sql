/*
 * Copyright (c) 2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--delete potential orphans
DELETE FROM ehr_compliancedb.requirements WHERE container IS NULL OR (select entityid FROM core.containers WHERE entityid = container) IS NULL;

ALTER TABLE ehr_compliancedb.requirements ADD rowid serial;

-- refactor foreign keys back into trigger scripts / java code.  this was done b/c
-- some tables are now scoped to a container, like requirements, and it is simply easier to enforce them from triggers than DB FKs
ALTER TABLE ehr_compliancedb.completiondates DROP CONSTRAINT fk_completiondates_employeeid;
ALTER TABLE ehr_compliancedb.employeerequirementexemptions DROP CONSTRAINT fk_employeerequirementexemptions_employeeid;
ALTER TABLE ehr_compliancedb.completiondates DROP CONSTRAINT fk_completiondates_requirementname;
ALTER TABLE ehr_compliancedb.employeerequirementexemptions DROP CONSTRAINT fk_employeerequirementexemptions_requirementname;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_type;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_category;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_title;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_unit;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_location;
ALTER TABLE ehr_compliancedb.requirements DROP CONSTRAINT fk_requirements_type;
ALTER TABLE ehr_compliancedb.requirementspercategory DROP CONSTRAINT fk_requirementspercategory_requirementname;
ALTER TABLE ehr_compliancedb.requirementspercategory DROP CONSTRAINT fk_requirementspercategory_category;
ALTER TABLE ehr_compliancedb.requirementspercategory DROP CONSTRAINT fk_requirementspercategory_unit;
ALTER TABLE ehr_compliancedb.requirementsperemployee DROP CONSTRAINT fk_requirementsperemployee_employeeid;
ALTER TABLE ehr_compliancedb.requirementsperemployee DROP CONSTRAINT fk_requirementsperemployee_requirementname;
ALTER TABLE ehr_compliancedb.sopbycategory DROP CONSTRAINT fk_sopbycategory_category;
ALTER TABLE ehr_compliancedb.sopdates DROP CONSTRAINT fk_sopdates_employeeid;

SELECT core.fn_dropifexists('requirements', 'ehr_compliancedb', 'CONSTRAINT', 'PK_requirements');
ALTER TABLE ehr_compliancedb.requirements ADD CONSTRAINT pk_requirements PRIMARY KEY (rowid);