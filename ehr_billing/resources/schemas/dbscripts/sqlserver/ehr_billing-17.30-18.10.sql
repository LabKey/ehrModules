/*
 * Copyright (c) 2017-2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* ehr_billing-17.30-17.31.sql */

--this table contains records of misc charges that have happened that cannot otherwise be
--automatically inferred from the record
CREATE TABLE ehr_billing.miscCharges (
  objectid entityid NOT NULL,
  id nvarchar(100),
  date DATETIME,
  project integer,
  category nvarchar(100),
  chargeId int,
  quantity double precision,
  unitcost double precision,
  comment nvarchar(4000),
  chargeType nvarchar(200),
  billingDate DATETIME,
  invoiceId entityid,
  invoicedItemId entityid,
  item nvarchar(500),
  sourceInvoicedItem entityid,
  creditedaccount nvarchar(100),
  debitedaccount nvarchar(200),
  qcstate int,
  parentid entityid,
  issueId int,
  formSort integer,
  chargeCategory nvarchar(100),
  
  taskid entityid,
  requestid entityid,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_miscCharges PRIMARY KEY (objectid)
);

--this table contains one row each time a billing run is performed, which gleans items to be charged from a variety of sources
--and snapshots them into invoicedItems
CREATE TABLE ehr_billing.invoiceRuns (
  rowId INT IDENTITY(1,1) NOT NULL,
  dataSources nvarchar(1000),
  comment nvarchar(4000),
  runDate DATETIME,
  billingPeriodStart DATETIME,
  billingPeriodEnd DATETIME,
  objectid entityid NOT NULL,
  invoiceNumber nvarchar(200),
  status nvarchar(200),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_invoiceRuns PRIMARY KEY (objectid)
);

--this table contains a snapshot of items actually invoiced, which will draw from many places in the animal record
CREATE TABLE ehr_billing.invoicedItems (
  rowId INT IDENTITY(1,1) NOT NULL,
  id nvarchar(100),
  date DATETIME,
  debitedaccount nvarchar(100),
  creditedaccount nvarchar(100),
  category nvarchar(100),
  item nvarchar(500),
  quantity double precision,
  unitcost double precision,
  totalcost double precision,
  chargeId int,
  rateId int,
  exemptionId int,
  comment nvarchar(4000),
  sourceRecord nvarchar(200),
  billingId int,
  credit bit,
  lastName nvarchar(100),
  firstName nvarchar(100),
  project int,
  invoiceDate DATETIME,
  invoiceNumber int,
  transactionType nvarchar(10),
  department nvarchar(100),
  mailcode nvarchar(20),
  contactPhone nvarchar(30),
  faid int,
  cageId int,
  objectId entityid NOT NULL,
  itemCode nvarchar(100),
  creditAccountId int,
  invoiceId entityid,
  servicecenter nvarchar(200),
  transactionNumber nvarchar(100),
  investigatorId int,
  chargeCategory nvarchar(100),
  sourcerecord2 nvarchar(100),
  issueId int,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_invoicedItems PRIMARY KEY (objectid)
);

/* ehr_billing-17.31-17.32.sql */

CREATE TABLE ehr_billing.chargeableItems (

  rowId INT IDENTITY(1,1) NOT NULL,
  name  nvarchar(200),
  shortName  nvarchar(100),
  category  nvarchar(200),
  comment  nvarchar(4000),
  active  bit default 1,
  startDate  datetime,
  endDate  datetime,
  itemCode nvarchar(100),
  departmentCode  nvarchar(100),
  allowsCustomUnitCost bit DEFAULT 0,
  canRaiseFA bit DEFAULT 0,
  allowBlankId bit DEFAULT 0,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created  datetime,
  modifiedBy USERID,
  modified  datetime,

  CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId)
);
/* ehr_billing-17.32-17.33.sql */

ALTER TABLE ehr_billing.chargeableItems ADD LSID LSIDtype;

/* ehr_billing-17.33-17.34.sql */

CREATE TABLE ehr_billing.chargeRateExemptions (

  rowId INT IDENTITY(1,1) NOT NULL,
  project int,
  chargeId int,
  unitcost double precision,
  startDate datetime,
  endDate datetime,
  remark nvarchar(4000),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created datetime,
  modifiedBy USERID,
  modified datetime,

  CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId)
);

CREATE TABLE ehr_billing.chargeUnits (

  chargetype nvarchar(100) NOT NULL,
  shownInBlood bit default 0,
  shownInLabwork bit default 0,
  shownInMedications bit default 0,
  shownInProcedures bit default 0,
  servicecenter nvarchar(100),

  active bit default 1,
  container entityid,
  createdBy int,
  created datetime,
  modifiedBy int,
  modified datetime,

  CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype)
);

/* ehr_billing-17.34-17.35.sql */

ALTER TABLE ehr_billing.chargeRateExemptions ALTER COLUMN remark nvarchar(max);

ALTER TABLE ehr_billing.chargeRateExemptions ADD CONSTRAINT FK_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_CHARGE_RATE_EXEMPTIONS_CONTAINER_INDEX ON ehr_billing.chargeRateExemptions (Container);
GO

ALTER TABLE ehr_billing.chargeUnits ADD CONSTRAINT FK_EHR_BILLING_CHARGE_UNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_CHARGE_UNITS_CONTAINER_INDEX ON ehr_billing.chargeUnits (Container);
GO

ALTER TABLE ehr_billing.invoiceRuns ADD CONSTRAINT FK_EHR_BILLING_INVOICE_RUNS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX ON ehr_billing.invoiceRuns (Container);
GO

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX ON ehr_billing.invoicedItems (Container);
GO

ALTER TABLE ehr_billing.miscCharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX ON ehr_billing.miscCharges (Container);
GO

/* ehr_billing-17.35-17.36.sql */

CREATE TABLE ehr_billing.invoice (

  rowid INT IDENTITY(1,1) NOT NULL,
  invoiceNumber int,
  invoiceRunId ENTITYID,
  accountNumber nvarchar(10),
  invoiceSentOn datetime,
  invoiceAmount double precision,
  invoiceSentComment nvarchar(10),
  paymentAmountReceived double precision,
  fullPaymentReceived bit default 0,
  paymentReceivedOn datetime,
  paymentReceivedComment nvarchar(10),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created datetime,
  modifiedBy USERID,
  modified datetime,

  CONSTRAINT PK_EHR_BILLING_INVOICE PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_INVOICE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_INVOICE_CONTAINER_INDEX ON ehr_billing.invoice (Container);
GO

ALTER TABLE ehr_billing.invoiceRuns DROP COLUMN invoiceNumber;
GO

/* ehr_billing-17.36-17.37.sql */

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber nvarchar(20);
GO

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber nvarchar(20);
GO

/* ehr_billing-17.37-17.38.sql */

ALTER TABLE ehr_billing.invoice DROP CONSTRAINT PK_EHR_BILLING_INVOICE;
GO

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber nvarchar(20) NOT NULL;
GO

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber);
GO

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber nvarchar(20) NOT NULL;
GO

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
GO

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);
GO

CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);
GO