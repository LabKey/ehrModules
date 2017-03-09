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