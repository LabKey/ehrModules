/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* ehr-17.20-17.21.sql */

CREATE TABLE ehr.observation_types (
  rowid serial NOT NULL,
  value varchar(200),
  category varchar(200),
  editorconfig varchar(4000),
  schemaname varchar(200),
  queryname varchar(200),
  valuecolumn varchar(200),
  Created TIMESTAMP,
  CreatedBy USERID,
  Modified TIMESTAMP,
  ModifiedBy USERID,
  Container	entityId NOT NULL,

  CONSTRAINT PK_EHR_OBSERVATION_TYPES PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_OBSERVATION_TYPES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
CREATE INDEX EHR_OBSERVATION_TYPES_CONTAINER_INDEX ON ehr.observation_types (Container);

/* ehr-17.21-17.22.sql */

ALTER TABLE ehr.protocol ADD COLUMN LSID LSIDtype;
ALTER TABLE ehr.project ADD COLUMN LSID LSIDtype;

/* ehr-17.22-17.23.sql */

ALTER TABLE ehr.reports ADD COLUMN ReportStatus TEXT;