/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* ehr-17.20-17.21.sql */

CREATE TABLE ehr.observation_types (
  rowid INT IDENTITY(1,1) NOT NULL,
  value varchar(200),
  category varchar(200),
  editorconfig varchar(4000),
  schemaname varchar(200),
  queryname varchar(200),
  valuecolumn varchar(200),
  Created DATETIME,
  CreatedBy USERID,
  Modified DATETIME,
  ModifiedBy USERID,
  Container	entityId NOT NULL,

  CONSTRAINT PK_EHR_OBSERVATION_TYPES PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_OBSERVATION_TYPES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

CREATE INDEX EHR_OBSERVATION_TYPES_CONTAINER_INDEX ON ehr.observation_types (Container);
GO

/* ehr-17.21-17.22.sql */

ALTER TABLE ehr.protocol ADD Lsid LsidType null;
ALTER TABLE ehr.project ADD Lsid LsidType null;

/* ehr-17.22-17.23.sql */

ALTER TABLE ehr.reports ADD ReportStatus NVARCHAR(MAX);