
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