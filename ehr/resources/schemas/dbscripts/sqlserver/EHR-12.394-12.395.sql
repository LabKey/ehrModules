ALTER TABLE ehr.project DROP PK_project;
ALTER TABLE ehr.protocol DROP PK_protocol;
GO
ALTER TABLE ehr.project ADD objectid ENTITYID NOT NULL DEFAULT newid();
ALTER TABLE ehr.protocol ADD objectid ENTITYID NOT NULL DEFAULT newid();
GO
ALTER TABLE ehr.project ADD CONSTRAINT PK_project PRIMARY KEY (objectid);
ALTER TABLE ehr.protocol ADD CONSTRAINT PK_protocol PRIMARY KEY (objectid);
