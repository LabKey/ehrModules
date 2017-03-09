/* EHR-16.30-16.31.sql */

ALTER TABLE ehr.animal_groups ADD diCreated DATETIME;
ALTER TABLE ehr.animal_groups ADD diModified DATETIME;
ALTER TABLE ehr.animal_groups ADD diCreatedBy USERID;
ALTER TABLE ehr.animal_groups ADD diModifiedBy USERID;

ALTER TABLE ehr.project ADD diCreated DATETIME;
ALTER TABLE ehr.project ADD diModified DATETIME;
ALTER TABLE ehr.project ADD diCreatedBy USERID;
ALTER TABLE ehr.project ADD diModifiedBy USERID;

ALTER TABLE ehr.protocol ADD diCreated DATETIME;
ALTER TABLE ehr.protocol ADD diModified DATETIME;
ALTER TABLE ehr.protocol ADD diCreatedBy USERID;
ALTER TABLE ehr.protocol ADD diModifiedBy USERID;