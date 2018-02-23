/* ehr-17.30-17.31.sql */

-- add LSID column to tables to allow them to be extensible
ALTER TABLE ehr.protocol_counts ADD lsid LsidType;
ALTER TABLE ehr.snomed_tags ADD lsid LsidType;

/* ehr-17.31-17.32.sql */

CREATE TABLE ehr.protocol_amendments
(
  RowId INT IDENTITY (1, 1) NOT NULL,
  Created DATETIME,
  CreatedBy USERID,
  Modified DATETIME,
  ModifiedBy USERID,
  Container ENTITYID NOT NULL,
  ObjectId ENTITYID,

  Project INTEGER,
  Protocol VARCHAR(200),
  Date DATETIME,
  Submitted DATETIME,
  Approved DATETIME,
  Comment VARCHAR(4000),
  Lsid LSIDtype,

  CONSTRAINT PK_protocol_amendments PRIMARY KEY (RowId),
  CONSTRAINT FK_protocol_amendments_Container FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);