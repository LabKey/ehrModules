/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr.investigators (
  rowid SERIAL NOT NULL,
  firstName varchar(100),
  lastName varchar(100),
  position varchar(100),
  address varchar(500),
  city varchar(100),
  state varchar(100),
  country varchar(100),
  zip varchar(100),
  phoneNumber varchar(100),
  investigatorType varchar(100),
  emailAddress varchar(100),
  dateCreated timestamp,
  dateDisabled timestamp,
  division varchar(100),
  userid int,

  Lsid LSIDtype,
  Created TIMESTAMP,
  CreatedBy USERID,
  Modified TIMESTAMP,
  ModifiedBy USERID,
  Container ENTITYID NOT NULL,

  CONSTRAINT PK_EHR_INVESTIGATORS PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_INVESTIGATORS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IX_EHR_INVESTIGATORS_CONTAINER ON ehr.investigators (Container);