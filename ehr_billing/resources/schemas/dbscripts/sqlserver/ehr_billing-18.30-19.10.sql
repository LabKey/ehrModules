/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_billing.fiscalAuthorities (
  rowid int identity(1,1) NOT NULL,
  faid varchar(100),
  firstName varchar(100),
  lastName varchar(100),
  position varchar(100),
  address varchar(500),
  city varchar(100),
  state varchar(100),
  country varchar(100),
  zip varchar(100),
  phoneNumber varchar(100),
  active bit default 1,
  objectid ENTITYID,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT pk_fiscalAuthorities PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_BILLING_FISCAL_AUTHORITIES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_FISCAL_AUTHORITIES_CONTAINER_INDEX ON ehr_billing.fiscalAuthorities (container);

ALTER TABLE ehr_billing.aliases DROP COLUMN aliasEnabled;
ALTER TABLE ehr_billing.aliases ADD isAcceptingCharges bit DEFAULT 1;

ALTER TABLE ehr_billing.invoice ADD balanceDue DECIMAL(13,2);
GO

ALTER TABLE ehr_billing.miscCharges ADD investigator nvarchar(100);
GO