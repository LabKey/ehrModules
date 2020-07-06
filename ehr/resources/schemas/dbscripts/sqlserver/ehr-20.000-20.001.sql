--ehr-17.20-17.21.sql script is getting skipped on teamcity, so adding the contents of this script below:

--Merged script from conflicting ehr-12.425-12.426.sql scripts authored in different branches, trunk and modules15.2

ALTER TABLE ehr.protocol ADD contacts VARCHAR(200);

-- Merging upgrade scripts, ensure that we end up with rows for 'Started' in both tables
DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Started';
DELETE FROM ehr.status WHERE Label = 'Started';

INSERT INTO ehr.qcStateMetadata
    (QCStateLabel,draftData,isDeleted,isRequest)
VALUES
       ('Started', 1, 0, 0);
INSERT INTO ehr.status
    (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES
       ('Started', 'Record has started, but not completed',1,0,0,0,0);

-- ehr-17.21-17.22.sql script is getting skipped on teamcity, so adding the contents of this script below:

CREATE TABLE ehr.form_framework_types (
  RowId INT IDENTITY(1,1) NOT NULL,

  schemaname varchar(255) DEFAULT NULL,
  queryname varchar(255) DEFAULT NULL,
  framework varchar(255) DEFAULT NULL,

  Container ENTITYID NOT NULL,
  CreatedBy USERID,
  Created datetime,
  ModifiedBy USERID,
  Modified datetime,

  CONSTRAINT PK_form_framework_types PRIMARY KEY (schemaname, queryname)
);