
CREATE TABLE ehr.protocol_amendments
(
  RowId SERIAL NOT NULL,
  Created TIMESTAMP,
  CreatedBy USERID,
  Modified TIMESTAMP,
  ModifiedBy USERID,
  Container ENTITYID NOT NULL,
  ObjectId ENTITYID,

  Project INTEGER,
  Protocol VARCHAR(200),
  Date TIMESTAMP,
  Submitted TIMESTAMP,
  Approved TIMESTAMP,
  Comment VARCHAR(4000),
  Lsid LSIDtype,

  CONSTRAINT PK_protocol_amendments PRIMARY KEY (RowId),
  CONSTRAINT FK_protocol_amendments_Container FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);