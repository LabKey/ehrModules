/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/* ehr_billing-17.20-17.30.sql */

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

ALTER TABLE ehr_billing.aliases ADD COLUMN LSID LSIDtype;
ALTER TABLE ehr_billing.chargeRates ADD COLUMN LSID LSIDtype;

/* ehr_billing-17.30-18.10.sql */

--this table contains records of misc charges that have happened that cannot otherwise be
--automatically inferred from the record
CREATE TABLE ehr_billing.miscCharges (
  objectid entityid NOT NULL,
  id varchar(100),
  date timestamp,
  project integer,
  category varchar(100),
  chargeId int,
  quantity double precision,
  unitcost double precision,
  comment varchar(4000),
  chargeType varchar(200),
  billingDate timestamp,
  invoiceId entityid,
  invoicedItemId entityid,
  item varchar(500),
  sourceInvoicedItem entityid,
  creditedaccount varchar(100),
  debitedaccount varchar(200),
  qcstate int,
  parentid entityid,
  issueId int,
  formSort integer,
  chargeCategory VARCHAR(100),

  taskid entityid,
  requestid entityid,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_miscCharges PRIMARY KEY (objectid)
);

--this table contains one row each time a billing run is performed, which gleans items to be charged from a variety of sources
--and snapshots them into invoicedItems
CREATE TABLE ehr_billing.invoiceRuns (
  rowId SERIAL NOT NULL,
  dataSources varchar(1000),
  comment varchar(4000),
  runDate timestamp,
  billingPeriodStart timestamp,
  billingPeriodEnd timestamp,
  objectid entityid NOT NULL,
  invoiceNumber varchar(200),
  status varchar(200),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT pk_invoiceRuns PRIMARY KEY (objectid)
);

--this table contains a snapshot of items actually invoiced, which will draw from many places in the animal record
CREATE TABLE ehr_billing.invoicedItems (
  rowId SERIAL NOT NULL,
  id varchar(100),
  date timestamp,
  debitedaccount varchar(100),
  creditedaccount varchar(100),
  category varchar(100),
  item varchar(500),
  quantity double precision,
  unitcost double precision,
  totalcost double precision,
  chargeId int,
  rateId int,
  exemptionId int,
  comment varchar(4000),
  sourceRecord varchar(200),
  billingId int,
  credit boolean,
  lastName varchar(100),
  firstName varchar(100),
  project int,
  invoiceDate timestamp,
  invoiceNumber int,
  transactionType varchar(10),
  department varchar(100),
  mailcode varchar(20),
  contactPhone varchar(30),
  faid int,
  cageId int,
  objectId entityid NOT NULL,
  itemCode varchar(100),
  creditAccountId int,
  invoiceId entityid,
  servicecenter varchar(200),
  transactionNumber varchar(100),
  investigatorId int,
  chargeCategory varchar(100),
  sourcerecord2 varchar(100),
  issueId int,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_invoicedItems PRIMARY KEY (objectid)
);

CREATE TABLE ehr_billing.chargeableItems (

  rowId SERIAL NOT NULL,
  name varchar(200),
  shortName varchar(100),
  category varchar(200),
  comment varchar(4000),
  active boolean default true,
  startDate timestamp,
  endDate timestamp,
  itemCode varchar(100),
  departmentCode varchar(100),
  allowsCustomUnitCost boolean DEFAULT false,
  canRaiseFA boolean DEFAULT false,
  allowBlankId boolean DEFAULT false,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId)
);

ALTER TABLE ehr_billing.chargeableItems ADD COLUMN LSID LSIDtype;

CREATE TABLE ehr_billing.chargeRateExemptions (

  rowId SERIAL NOT NULL,
  project int,
  chargeId int,
  unitcost double precision,
  startDate timestamp,
  endDate timestamp,
  remark varchar(4000),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId)
);

CREATE TABLE ehr_billing.chargeUnits (

  chargetype varchar(100) NOT NULL,
  shownInBlood boolean default false,
  shownInLabwork boolean default false,
  shownInMedications boolean default false,
  shownInProcedures boolean default false,
  servicecenter varchar(100),

  active boolean default true,
  container entityid,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype)
);

ALTER TABLE ehr_billing.chargeRateExemptions ALTER remark TYPE TEXT;

ALTER TABLE ehr_billing.chargeRateExemptions ADD CONSTRAINT FK_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_CHARGE_RATE_EXEMPTIONS_CONTAINER_INDEX ON ehr_billing.chargeRateExemptions (Container);

ALTER TABLE ehr_billing.chargeUnits ADD CONSTRAINT FK_EHR_BILLING_CHARGE_UNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_CHARGE_UNITS_CONTAINER_INDEX ON ehr_billing.chargeUnits (Container);

ALTER TABLE ehr_billing.invoiceRuns ADD CONSTRAINT FK_EHR_BILLING_INVOICE_RUNS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX ON ehr_billing.invoiceRuns (Container);

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX ON ehr_billing.invoicedItems (Container);

ALTER TABLE ehr_billing.miscCharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX ON ehr_billing.miscCharges (Container);

CREATE TABLE ehr_billing.invoice (

  rowId SERIAL NOT NULL,
  invoiceNumber integer,
  invoiceRunId ENTITYID,
  accountNumber varchar(10),
  invoiceSentOn timestamp,
  invoiceAmount double precision,
  invoiceSentComment varchar(10),
  paymentAmountReceived double precision,
  fullPaymentReceived boolean,
  paymentReceivedOn timestamp,
  paymentReceivedComment varchar(10),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_EHR_BILLING_INVOICE PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_INVOICE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_INVOICE_CONTAINER_INDEX ON ehr_billing.invoice (Container);

ALTER TABLE ehr_billing.invoiceRuns DROP invoiceNumber;

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber TYPE varchar(20);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber TYPE varchar(20);

ALTER TABLE ehr_billing.invoice DROP CONSTRAINT PK_EHR_BILLING_INVOICE;
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber SET NOT NULL;
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber);

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber SET NOT NULL;

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);

CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);

/* ehr_billing-18.20-18.30.sql */

SELECT core.fn_dropifexists('invoicedItems', 'ehr_billing', 'CONSTRAINT', 'FK_INVOICEDITEMS_INVOICENUM');

SELECT core.fn_dropifexists('chargeableItems','ehr_billing','TABLE', NULL);
SELECT core.fn_dropifexists('chargeRateExemptions','ehr_billing','TABLE', NULL);
SELECT core.fn_dropifexists('chargeUnits','ehr_billing','TABLE', NULL);
SELECT core.fn_dropifexists('invoice','ehr_billing','TABLE', NULL);

CREATE TABLE ehr_billing.chargeableItems (

  rowId SERIAL NOT NULL,
  name varchar(200),
  shortName varchar(100),
  category varchar(200),
  comment varchar(4000),
  active boolean default true,
  startDate timestamp,
  endDate timestamp,
  itemCode varchar(100),
  departmentCode varchar(100),
  allowsCustomUnitCost boolean DEFAULT false,
  canRaiseFA boolean DEFAULT false,
  allowBlankId boolean DEFAULT false,
  LSID LSIDtype,
  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_CHARGEABLEITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE TABLE ehr_billing.chargeRateExemptions (

  rowId SERIAL NOT NULL,
  project int,
  chargeId int,
  unitcost double precision,
  startDate timestamp,
  endDate timestamp,
  remark TEXT,
  LSID LSIDtype,
  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_CHARGERATEEXEMPTIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE TABLE ehr_billing.chargeUnits (

  chargetype varchar(100) NOT NULL,
  shownInBlood boolean default false,
  shownInLabwork boolean default false,
  shownInMedications boolean default false,
  shownInProcedures boolean default false,
  servicecenter varchar(100),
  active boolean default true,
  LSID LSIDtype,
  container entityid,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype),
  CONSTRAINT FK_EHR_BILLING_CHARGEUNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE TABLE ehr_billing.invoice (

  rowId SERIAL NOT NULL,
  invoiceNumber varchar(20) NOT NULL,
  invoiceRunId ENTITYID,
  accountNumber varchar(10),
  invoiceSentOn timestamp,
  invoiceAmount double precision,
  invoiceSentComment varchar(10),
  paymentAmountReceived double precision,
  fullPaymentReceived boolean,
  paymentReceivedOn timestamp,
  paymentReceivedComment varchar(10),
  LSID LSIDtype,
  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber),
  CONSTRAINT FK_EHR_BILLING_INVOICE_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_INVOICE_CONTAINER_INDEX ON ehr_billing.invoice (Container);
CREATE INDEX EHR_BILLING_CHARGEUNITS_CONTAINER_INDEX ON ehr_billing.chargeUnits (Container);
CREATE INDEX EHR_BILLING_CHARGERATEEXEMPTIONS_CONTAINER_INDEX ON ehr_billing.chargeRateExemptions (Container);
CREATE INDEX EHR_BILLING_CHARGEABLEITEMS_CONTAINER_INDEX ON ehr_billing.chargeableItems (Container);

ALTER TABLE ehr_billing.invoiceditems ADD COLUMN Lsid LSIDType;
ALTER TABLE ehr_billing.invoiceruns ADD COLUMN Lsid LSIDType;
ALTER TABLE ehr_billing.miscCharges ADD COLUMN Lsid LSIDType;

SELECT core.fn_dropifexists('invoiceRuns', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICE_RUNS_CONTAINER');
SELECT core.fn_dropifexists('invoicedItems', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER');
SELECT core.fn_dropifexists('miscCharges', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_MISC_CHARGES_CONTAINER');

SELECT core.fn_dropifexists('invoiceRuns', 'ehr_billing', 'INDEX', 'EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX');
SELECT core.fn_dropifexists('invoicedItems', 'ehr_billing', 'INDEX', 'EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX');
SELECT core.fn_dropifexists('miscCharges', 'ehr_billing', 'INDEX', 'EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX');


ALTER TABLE ehr_billing.invoiceRuns ADD CONSTRAINT FK_EHR_BILLING_INVOICE_RUNS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICE_RUNS_CONTAINER_INDEX ON ehr_billing.invoiceRuns (Container);

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_INVOICED_ITEMS_CONTAINER_INDEX ON ehr_billing.invoicedItems (Container);

ALTER TABLE ehr_billing.miscCharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId);
CREATE INDEX EHR_BILLING_MISC_CHARGES_CONTAINER_INDEX ON ehr_billing.miscCharges (Container);

SELECT core.fn_dropifexists('invoiceRuns', 'ehr_billing', 'COLUMN', 'invoiceNumber');
SELECT core.fn_dropifexists('invoicedItems', 'ehr_billing', 'COLUMN', 'invoiceNumber');

TRUNCATE TABLE ehr_billing.invoicedItems;
ALTER TABLE ehr_billing.invoicedItems ADD COLUMN invoiceNumber varchar(20) NOT NULL;

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);

SELECT core.fn_dropifexists('invoicedItems', 'ehr_billing', 'CONSTRAINT', 'EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX');

CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);

CREATE TABLE ehr_billing.chargeableItemCategories (
  rowId SERIAL NOT NULL,
  name varchar(100) NOT NULL,
  dateDisabled timestamp,

  container entityid NOT NULL,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_chargeableItemCategories PRIMARY KEY (rowId)
);

TRUNCATE ehr_billing.chargeableItems;
ALTER TABLE ehr_billing.chargeableItems DROP COLUMN category;
ALTER TABLE ehr_billing.chargeableItems ADD chargeCategoryId INT NOT NULL;
ALTER TABLE ehr_billing.chargeableItems ADD CONSTRAINT fk_chargeableItems FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowId);
CREATE INDEX IX_ehr_billing_chargebleItems ON ehr_billing.chargeableItems (chargeCategoryId);

ALTER TABLE ehr_billing.chargeRates ALTER COLUMN unitCost TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceAmount TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentAmountReceived TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN unitCost TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN totalCost TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN unitCost TYPE DECIMAL(13,2);

CREATE TABLE ehr_billing.dataAccess (
  rowId serial NOT NULL,
  userid int,
  investigatorId int,
  project int,
  allData boolean,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_dataAccess PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_DATA_ACCESS_CONTAINER_INDEX ON ehr_billing.dataAccess (Container);

/* ehr_billing-18.30-19.10.sql */

CREATE TABLE ehr_billing.fiscalAuthorities (
  rowid serial,
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
  active boolean default true,
  objectid ENTITYID,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT pk_fiscalAuthorities PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_BILLING_FISCAL_AUTHORITIES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_FISCAL_AUTHORITIES_CONTAINER_INDEX ON ehr_billing.fiscalAuthorities (container);

ALTER TABLE ehr_billing.aliases DROP COLUMN aliasEnabled;
ALTER TABLE ehr_billing.aliases ADD isAcceptingCharges boolean DEFAULT true;

ALTER TABLE ehr_billing.invoice ADD balanceDue DECIMAL(13,2);
ALTER TABLE ehr_billing.miscCharges ADD investigator varchar(100);

/* ehr_billing-19.10-19.20.sql */

-- dropping to avoid duplicate index, EHR_BILLING_ALIASES_INDEX includes index to container
SELECT core.fn_dropifexists ('aliases', 'ehr_billing', 'INDEX', 'ehr_billing_aliases_container_index');

-- constraint and index in chargeRates table
SELECT core.fn_dropifexists ('chargeRates', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_CHARGE_RATES_CHARGEID');
ALTER TABLE ehr_billing.chargeRates ADD CONSTRAINT FK_EHR_BILLING_CHARGE_RATES_CHARGEID FOREIGN KEY (chargeId) REFERENCES ehr_billing.chargeableItems (rowid);

SELECT core.fn_dropifexists ('chargeRates', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATES_CHARGEID');
CREATE INDEX IX_EHR_BILLING_CHARGE_RATES_CHARGEID ON ehr_billing.chargeRates (chargeId);

-- constraint and index in dataaccess table
SELECT core.fn_dropifexists ('dataaccess', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_DATA_ACCESS_PROJECT');
CREATE INDEX IX_EHR_BILLING_DATA_ACCESS_PROJECT ON ehr_billing.dataaccess (project);

SELECT core.fn_dropifexists ('dataaccess', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_DATA_ACCESS_USERID');
ALTER TABLE ehr_billing.dataaccess ADD CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_USERID FOREIGN KEY (userid) REFERENCES core.Usersdata (UserId);

SELECT core.fn_dropifexists ('dataaccess', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_DATA_ACCESS_USERID');
CREATE INDEX IX_EHR_BILLING_DATA_ACCESS_USERID ON ehr_billing.dataaccess (userid);

-- constraint and index in invoice table
SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICE_INVOICERUNID');
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT FK_EHR_BILLING_INVOICE_INVOICERUNID FOREIGN KEY (invoicerunid) REFERENCES ehr_billing.invoiceRuns (objectid);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICERUNID');
CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICERUNID ON ehr_billing.invoice (invoicerunid);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER');
CREATE INDEX IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER ON ehr_billing.invoice (accountnumber);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'UQ_EHR_BILLING_INVOICE_INVOICENUMBER');
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UQ_EHR_BILLING_INVOICE_INVOICENUMBER UNIQUE (invoicenumber);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICENUMBER');
CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICENUMBER ON ehr_billing.invoice (invoicenumber);

-- constraint and index in invoicedItems
SELECT core.fn_dropifexists ('invoiceditems', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICED_ITEMS_CHARGEID');
ALTER TABLE ehr_billing.invoiceditems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CHARGEID FOREIGN KEY (chargeid) REFERENCES ehr_billing.chargeableItems (rowid);

SELECT core.fn_dropifexists ('invoiceditems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICED_ITEMS_CHARGEID');
CREATE INDEX IX_EHR_BILLING_INVOICED_ITEMS_CHARGEID ON ehr_billing.invoiceditems (chargeid);

-- constraint and index in miscCharges
SELECT core.fn_dropifexists ('misccharges', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_MISC_CHARGES_CHARGEID');
ALTER TABLE ehr_billing.misccharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CHARGEID FOREIGN KEY (chargeid) REFERENCES ehr_billing.chargeableItems (rowid);

SELECT core.fn_dropifexists ('misccharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_CHARGEID');
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_CHARGEID ON ehr_billing.misccharges (chargeid);

SELECT core.fn_dropifexists ('misccharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_PROJECT');
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_PROJECT ON ehr_billing.misccharges (project);

-- index on lsid col in extensible tables
SELECT core.fn_dropifexists ('aliases', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_ALIASES_LSID');
CREATE INDEX IX_EHR_BILLING_ALIASES_LSID ON ehr_billing.aliases (lsid);

SELECT core.fn_dropifexists ('chargeRates', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATES_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGE_RATES_LSID ON ehr_billing.chargeRates (lsid);

SELECT core.fn_dropifexists ('chargeableItems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGEABLE_ITEMS_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGEABLE_ITEMS_LSID ON ehr_billing.chargeableItems (lsid);

SELECT core.fn_dropifexists ('invoiceRuns', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_RUNS_LSID');
CREATE INDEX IX_EHR_BILLING_INVOICE_RUNS_LSID ON ehr_billing.invoiceRuns (lsid);

SELECT core.fn_dropifexists ('invoicedItems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICED_ITEMS_LSID');
CREATE INDEX IX_EHR_BILLING_INVOICED_ITEMS_LSID ON ehr_billing.invoicedItems (lsid);

SELECT core.fn_dropifexists ('miscCharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_LSID');
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_LSID ON ehr_billing.miscCharges (lsid);

SELECT core.fn_dropifexists ('chargeUnits', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_UNITS_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGE_UNITS_LSID ON ehr_billing.chargeUnits (lsid);

SELECT core.fn_dropifexists ('chargeRateExemptions', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_LSID ON ehr_billing.chargeRateExemptions (lsid);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_LSID');
CREATE INDEX IX_EHR_BILLING_INVOICE_LSID ON ehr_billing.invoice (lsid);

-- drop Index and Constraints
SELECT core.fn_dropifexists ('invoicedItems', 'ehr_billing', 'INDEX', 'EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX');

SELECT core.fn_dropifexists ('invoicedItems', 'ehr_billing', 'CONSTRAINT', 'FK_INVOICEDITEMS_INVOICENUM');

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'PK_EHR_BILLING_INVOICE_INVNUM');

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'UNIQUE_INVOICE_NUM');

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'UQ_EHR_BILLING_INVOICE_INVOICENUMBER');

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICENUMBER');

-- Modify invoiceNumber
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber TYPE varchar(100);

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber TYPE varchar(100);

-- Add Index and Constraints back
CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber);

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UQ_EHR_BILLING_INVOICE_INVOICENUMBER UNIQUE (invoicenumber);

CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICENUMBER ON ehr_billing.invoice (invoicenumber);

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);

ALTER TABLE ehr_billing.chargeableItemCategories ADD COLUMN LSID LSIDtype;

-- ehr_billing-18.33-18.34.sql
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceSentComment TYPE varchar(500);
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentReceivedComment TYPE varchar(500);

-- ehr_billing-18.34-18.35.sql - modified to add if column doesn't already exists
CREATE FUNCTION ehr_billing.addChargeGroupToMiscCharges() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='misccharges' and table_schema='ehr_billing' and column_name='chargegroup'
        )
    THEN
        ALTER TABLE ehr_billing.miscCharges ADD chargeGroup VARCHAR(200);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr_billing.addChargeGroupToMiscCharges();

DROP FUNCTION ehr_billing.addChargeGroupToMiscCharges();

--rename column chargetype to groupName - modified to rename if column exists/not renamed already
CREATE FUNCTION ehr_billing.renameChargeTypeToGroupName() RETURNS VOID AS $$
DECLARE
BEGIN
    IF EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='chargeunits' and table_schema='ehr_billing' and column_name='chargetype'
        )
    THEN
        ALTER TABLE ehr_billing.chargeUnits DROP CONSTRAINT PK_chargeUnits;
        ALTER TABLE ehr_billing.chargeUnits RENAME COLUMN chargetype TO groupName;
        ALTER TABLE ehr_billing.chargeUnits ADD CONSTRAINT PK_chargeUnits PRIMARY KEY (groupName);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr_billing.renameChargeTypeToGroupName();

DROP FUNCTION ehr_billing.renameChargeTypeToGroupName();


-- ehr_billing-18.35-18.36.sql - modified to add if column doesn't already exists
CREATE FUNCTION ehr_billing.addTotalCostToMiscCharges() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='misccharges' and table_schema='ehr_billing' and column_name='totalcost'
        )
    THEN
        ALTER TABLE ehr_billing.miscCharges ADD totalCost double precision;
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr_billing.addTotalCostToMiscCharges();

DROP FUNCTION ehr_billing.addTotalCostToMiscCharges();

-- Convert from a plain index to a unique constraint
SELECT core.fn_dropifexists ('aliases', 'ehr_billing', 'INDEX', 'EHR_BILLING_ALIASES_INDEX');

ALTER TABLE ehr_billing.aliases ADD CONSTRAINT UNIQUE_ALIAS UNIQUE (Container, alias);