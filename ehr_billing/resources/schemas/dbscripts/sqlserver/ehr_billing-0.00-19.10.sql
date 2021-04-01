/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/* ehr_billing-17.20-17.30.sql */

CREATE SCHEMA ehr_billing;
GO

CREATE TABLE ehr_billing.aliases (

  rowid INT IDENTITY(1,1) NOT NULL,
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
  budgetStartDate DATETIME,
  budgetEndDate DATETIME,
  projectTitle varchar(1000),
  projectDescription varchar(1000),
  projectStatus varchar(200),
  aliasType VARCHAR(100),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_aliases PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_BILLING_ALIASES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_ALIASES_INDEX ON ehr_billing.aliases (container, alias);
GO

CREATE INDEX EHR_BILLING_ALIASES_CONTAINER_INDEX ON ehr_billing.aliases (Container);
GO

CREATE TABLE ehr_billing.chargeRates (

  rowId INT IDENTITY(1,1) NOT NULL,
  chargeId int,
  unitcost double precision,
  subsidy double precision,
  startDate DATETIME,
  endDate DATETIME,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_chargeRates PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_CHARGE_RATES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_CHARGE_RATES_CONTAINER_INDEX ON ehr_billing.chargeRates (Container);
GO

ALTER TABLE ehr_billing.aliases ADD LSID LSIDtype;
ALTER TABLE ehr_billing.chargeRates ADD LSID LSIDtype;

/* ehr_billing-17.30-18.10.sql */

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

ALTER TABLE ehr_billing.chargeableItems ADD LSID LSIDtype;

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

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber nvarchar(20);
GO

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber nvarchar(20);
GO

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

/* ehr_billing-18.20-18.30.sql */

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'CONSTRAINT', 'FK_INVOICEDITEMS_INVOICENUM';
GO

EXEC core.fn_dropifexists 'chargeableItems','ehr_billing','TABLE', NULL;
GO

EXEC core.fn_dropifexists 'chargeRateExemptions','ehr_billing','TABLE', NULL;
GO

EXEC core.fn_dropifexists 'chargeUnits','ehr_billing','TABLE', NULL;
GO

EXEC core.fn_dropifexists 'invoice','ehr_billing','TABLE', NULL;
GO

CREATE TABLE ehr_billing.chargeableItems (

  rowId int IDENTITY(1,1),
  name varchar(200),
  shortName varchar(100),
  category varchar(200),
  comment varchar(4000),
  active BIT default 1,
  startDate DATETIME,
  endDate DATETIME,
  itemCode varchar(100),
  departmentCode varchar(100),
  allowsCustomUnitCost BIT DEFAULT 0,
  canRaiseFA BIT DEFAULT 0,
  allowBlankId BIT DEFAULT 0,
  LSID LSIDtype,
  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_CHARGEABLEITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE TABLE ehr_billing.chargeRateExemptions (

  rowId int IDENTITY(1,1),
  project int,
  chargeId int,
  unitcost double precision,
  startDate DATETIME,
  endDate DATETIME,
  remark TEXT,
  LSID LSIDtype,
  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_CHARGERATEEXEMPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE TABLE ehr_billing.chargeUnits (

  chargetype varchar(100) NOT NULL,
  shownInBlood BIT default 0,
  shownInLabwork BIT default 0,
  shownInMedications BIT default 0,
  shownInProcedures BIT default 0,
  servicecenter varchar(100),
  active BIT default 1,
  LSID LSIDtype,
  container entityid,
  createdBy int,
  created DATETIME,
  modifiedBy int,
  modified DATETIME,

  CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype),
  CONSTRAINT FK_EHR_BILLING_CHARGEUNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE TABLE ehr_billing.invoice (

  rowId int IDENTITY(1,1),
  invoiceNumber varchar(20) NOT NULL,
  invoiceRunId ENTITYID,
  accountNumber varchar(10),
  invoiceSentOn DATETIME,
  invoiceAmount double precision,
  invoiceSentComment varchar(10),
  paymentAmountReceived double precision,
  fullPaymentReceived BIT,
  paymentReceivedOn DATETIME,
  paymentReceivedComment varchar(10),
  LSID LSIDtype,
  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber),
  CONSTRAINT FK_EHR_BILLING_INVOICE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);
GO

CREATE INDEX EHR_BILLING_INVOICE_CONTAINER_INDEX ON ehr_billing.invoice (Container);
CREATE INDEX EHR_BILLING_CHARGEUNITS_CONTAINER_INDEX ON ehr_billing.chargeUnits (Container);
CREATE INDEX EHR_BILLING_CHARGERATEEXEMPTIONS_CONTAINER_INDEX ON ehr_billing.chargeRateExemptions (Container);
CREATE INDEX EHR_BILLING_CHARGEABLEITEMS_CONTAINER_INDEX ON ehr_billing.chargeableItems (Container);
GO

ALTER TABLE ehr_billing.invoiceditems ADD Lsid LSIDType;
ALTER TABLE ehr_billing.invoiceruns ADD Lsid LSIDType;
ALTER TABLE ehr_billing.miscCharges ADD Lsid LSIDType;
GO

EXEC core.fn_dropifexists 'invoiceRuns', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICE_RUNS_CONTAINER';
GO

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER';
GO

EXEC core.fn_dropifexists 'miscCharges', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_MISC_CHARGES_CONTAINER';
GO

EXEC core.fn_dropifexists 'invoiceRuns', 'ehr_billing', 'INDEX', 'EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX';
GO

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'INDEX', 'EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX';
GO

EXEC core.fn_dropifexists 'miscCharges', 'ehr_billing', 'INDEX', 'EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX';
GO

ALTER TABLE ehr_billing.invoiceRuns ADD CONSTRAINT FK_EHR_BILLING_INVOICE_RUNS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX ON ehr_billing.invoiceRuns (Container);

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX ON ehr_billing.invoicedItems (Container);

ALTER TABLE ehr_billing.miscCharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX ON ehr_billing.miscCharges (Container);
GO

EXEC core.fn_dropifexists 'invoiceRuns', 'ehr_billing', 'COLUMN', 'invoiceNumber';
GO

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'COLUMN', 'invoiceNumber';
GO

TRUNCATE TABLE ehr_billing.invoicedItems;
GO

ALTER TABLE ehr_billing.invoicedItems ADD invoiceNumber varchar(20) NOT NULL;
GO

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);
GO

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'CONSTRAINT', 'EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX';
GO

CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);
GO

CREATE TABLE ehr_billing.chargeableItemCategories (
  rowId int identity(1,1) NOT NULL,
  name varchar(100) NOT NULL,
  dateDisabled datetime,

  container entityid NOT NULL,
  createdBy int,
  created datetime,
  modifiedBy int,
  modified datetime,

  CONSTRAINT PK_chargeableItemCategories PRIMARY KEY (rowId)
);
GO

TRUNCATE TABLE ehr_billing.chargeableItems;
GO
ALTER TABLE ehr_billing.chargeableItems DROP COLUMN category;
GO
ALTER TABLE ehr_billing.chargeableItems ADD chargeCategoryId INT NOT NULL;
GO
ALTER TABLE ehr_billing.chargeableItems ADD CONSTRAINT fk_chargeableItems FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowId);
GO
CREATE INDEX IX_ehr_billing_chargebleItems ON ehr_billing.chargeableItems (chargeCategoryId);
GO

ALTER TABLE ehr_billing.chargeRates ALTER COLUMN unitCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceAmount DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentAmountReceived DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN unitCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN totalCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN unitCost DECIMAL(13,2);
GO

CREATE TABLE ehr_billing.dataAccess (
  rowId int identity(1,1) NOT NULL,
  userid int,
  investigatorId int,
  project int,
  allData bit,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_dataAccess PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_DATA_ACCESS_CONTAINER_INDEX ON ehr_billing.dataAccess (Container);
GO

/* ehr_billing-18.30-19.10.sql */

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