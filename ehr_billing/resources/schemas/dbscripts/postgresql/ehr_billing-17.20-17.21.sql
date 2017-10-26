/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

CREATE SCHEMA ehr_billing;

CREATE TABLE ehr_billing.aliases (

  rowid serial,
  alias varchar(200),
  aliasEnabled Varchar(100),
  projectNumber varchar(200),
  grantNumber varchar(200),
  agencyAwardNumber varchar(200),
  investigatorId int,
  investigatorName varchar(200),
  fiscalAuthority int,
  fiscalAuthorityName varchar(200),
  category varchar(100),
  faRate double precision,
  faSchedule varchar(200),
  budgetStartDate timestamp,
  budgetEndDate timestamp,
  projectTitle varchar(1000),
  projectDescription varchar(1000),
  projectStatus varchar(200),
  aliasType VARCHAR(100),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_aliases PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_BILLING_ALIASES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_ALIASES_INDEX ON ehr_billing.aliases (container, alias);
CREATE INDEX EHR_BILLING_ALIASES_CONTAINER_INDEX ON ehr_billing.aliases (Container);

CREATE TABLE ehr_billing.chargeRates (

  rowId SERIAL NOT NULL,
  chargeId int,
  unitcost double precision,
  subsidy double precision,
  startDate timestamp,
  endDate timestamp,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeRates PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_CHARGE_RATES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_CHARGE_RATES_CONTAINER_INDEX ON ehr_billing.chargeRates (Container);