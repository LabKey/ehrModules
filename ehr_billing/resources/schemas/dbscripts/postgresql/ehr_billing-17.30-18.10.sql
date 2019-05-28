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

/* ehr_billing-17.31-17.32.sql */

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

/* ehr_billing-17.32-17.33.sql */

ALTER TABLE ehr_billing.chargeableItems ADD COLUMN LSID LSIDtype;

/* ehr_billing-17.33-17.34.sql */

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

/* ehr_billing-17.34-17.35.sql */

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

/* ehr_billing-17.35-17.36.sql */

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

/* ehr_billing-17.36-17.37.sql */

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber TYPE varchar(20);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber TYPE varchar(20);

/* ehr_billing-17.37-17.38.sql */

ALTER TABLE ehr_billing.invoice DROP CONSTRAINT PK_EHR_BILLING_INVOICE;
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber SET NOT NULL;
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber);

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber SET NOT NULL;

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);

CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);