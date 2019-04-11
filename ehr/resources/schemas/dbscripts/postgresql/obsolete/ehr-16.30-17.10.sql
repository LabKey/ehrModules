/*
 * Copyright (c) 2016-2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* EHR-16.30-16.31.sql */

ALTER TABLE ehr.animal_groups ADD COLUMN diCreatedBy USERID;
ALTER TABLE ehr.animal_groups ADD COLUMN diCreated TIMESTAMP;
ALTER TABLE ehr.animal_groups ADD COLUMN diModifiedBy USERID;
ALTER TABLE ehr.animal_groups ADD COLUMN diModified TIMESTAMP;

ALTER TABLE ehr.project ADD COLUMN diCreatedBy USERID;
ALTER TABLE ehr.project ADD COLUMN diCreated TIMESTAMP;
ALTER TABLE ehr.project ADD COLUMN diModifiedBy USERID;
ALTER TABLE ehr.project ADD COLUMN diModified TIMESTAMP;

ALTER TABLE ehr.protocol ADD COLUMN diCreatedBy USERID;
ALTER TABLE ehr.protocol ADD COLUMN diCreated TIMESTAMP;
ALTER TABLE ehr.protocol ADD COLUMN diModifiedBy USERID;
ALTER TABLE ehr.protocol ADD COLUMN diModified TIMESTAMP;