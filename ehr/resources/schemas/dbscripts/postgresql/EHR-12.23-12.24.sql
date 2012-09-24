SELECT core.executeJavaUpgradeCode('modifyStudyColumns1');

CREATE TABLE ehr.services_requested (
  id varchar(100),
  daterequested timestamp,
  project INTEGER,
  account varchar(100),

  service INTEGER,
  category,INTEGER
  assignedto INTEGER,
  comment TEXT,
  container ENTITYID NOT NULL,
  createdby USERID NOT NULL,
  created TIMESTAMP NOT NULL,
  modifiedby USERID NOT NULL,
  modified TIMESTAMP NOT NULL,
  objectid ENTITYID,
  requestid ENTITYID,

);

