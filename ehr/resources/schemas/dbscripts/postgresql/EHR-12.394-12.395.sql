ALTER TABLE ehr.project DROP CONSTRAINT PK_project;
ALTER TABLE ehr.protocol DROP CONSTRAINT PK_protocol;

ALTER TABLE ehr.project ADD objectid UUID NOT NULL DEFAULT ehr.uuid();
ALTER TABLE ehr.protocol ADD objectid UUID NOT NULL DEFAULT ehr.uuid();

ALTER TABLE ehr.project ADD CONSTRAINT PK_project PRIMARY KEY (objectid);
ALTER TABLE ehr.protocol ADD CONSTRAINT PK_protocol PRIMARY KEY (objectid);
