/*
 * Copyright (c) 2018 LabKey Corporation
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