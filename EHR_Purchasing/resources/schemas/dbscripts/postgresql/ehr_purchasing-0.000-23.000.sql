/*
 * Copyright (c) 2020 LabKey Corporation
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

-- Create schema, tables, indexes, and constraints used for EHR_Purchasing module here
-- All SQL VIEW definitions should be created in ehr_purchasing-create.sql and dropped in ehr_purchasing-drop.sql
CREATE SCHEMA ehr_purchasing;

CREATE TABLE ehr_purchasing.vendor
(
    rowId       serial,
    vendorName  varchar(500),
    city        varchar(100),
    state       varchar(100),
    country     varchar(100),
    zip         varchar(15),
    phoneNumber varchar(50),
    email       varchar(500),

    LSID        LSIDtype,
    container   ENTITYID NOT NULL,
    createdBy   USERID,
    created     timestamp,
    modifiedBy  USERID,
    modified    timestamp,

    CONSTRAINT PK_EHR_PURCHASING_VENDOR PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_VENDOR_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_PURCHASING_VENDOR_CONTAINER ON ehr_purchasing.vendor (Container);

CREATE TABLE ehr_purchasing.shippingInfo
(
    rowId       serial,
    attentionTo varchar(500),
    city        varchar(100),
    state       varchar(100),
    country     varchar(100),
    zip         varchar(15),
    phoneNumber varchar(50),
    email       varchar(500),

    LSID        LSIDtype,
    container   ENTITYID NOT NULL,
    createdBy   USERID,
    created     timestamp,
    modifiedBy  USERID,
    modified    timestamp,

    CONSTRAINT PK_EHR_PURCHASING_SHIPPINGINFO PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_SHIPPINGINFO_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_PURCHASING_SHIPPINGINFO_CONTAINER ON ehr_purchasing.shippingInfo (Container);

-- line item unit, ex. EA = Each, BX = Box, etc.
CREATE TABLE ehr_purchasing.itemUnits
(
    rowId           serial,
    itemUnit        varchar(20),
    unitDescription varchar(200),

    LSID            LSIDtype,
    container       ENTITYID NOT NULL,
    createdBy       USERID,
    created         timestamp,
    modifiedBy      USERID,
    modified        timestamp,

    CONSTRAINT PK_EHR_PURCHASING_ITEM_UNITS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_ITEM_UNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_PURCHASING_ITEM_UNITS_CONTAINER ON ehr_purchasing.itemUnits (Container);

-- users associated with ehr_billing.aliases account
CREATE TABLE ehr_purchasing.userAccountAssociations
(
    rowId      serial,
    userId     int          NOT NULL,
    account    varchar(200) NOT NULL,

    LSID       LSIDtype,
    container  ENTITYID     NOT NULL,
    createdBy  USERID,
    created    timestamp,
    modifiedBy USERID,
    modified   timestamp,

    CONSTRAINT PK_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS PRIMARY KEY (rowId),
    CONSTRAINT UQ_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS UNIQUE (userId, account),
    CONSTRAINT FK_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS_CONTAINER ON ehr_purchasing.userAccountAssociations (Container);

-- line item status such as 'Ordered', 'Back ordered', 'Delivered' etc.
CREATE TABLE ehr_purchasing.lineItemStatus
(
    rowId      serial,
    status     varchar(100),

    LSID       LSIDtype,
    container  ENTITYID NOT NULL,
    createdBy  USERID,
    created    timestamp,
    modifiedBy USERID,
    modified   timestamp,

    CONSTRAINT PK_EHR_PURCHASING_LINE_ITEM_STATUS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEM_STATUS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEM_STATUS_CONTAINER ON ehr_purchasing.lineItemStatus (Container);

CREATE TABLE ehr_purchasing.purchasingRequests
(
    rowId          serial,
    requestId      entityid,
    vendorId       int,
    account        varchar(200),
    shippingInfoId int,
    justification  varchar,
    comments       varchar,
    qcStatus       int,

    LSID           LSIDtype,
    container      ENTITYID NOT NULL,
    createdBy      USERID,
    created        timestamp,
    modifiedBy     USERID,
    modified       timestamp,

    CONSTRAINT PK_EHR_PURCHASING_REQUESTS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_REQUESTS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),
    CONSTRAINT UQ_EHR_PURCHASING_REQUESTS_REQUEST_ID UNIQUE (requestId)
);

CREATE INDEX IDX_EHR_PURCHASING_REQUESTS_CONTAINER ON ehr_purchasing.purchasingRequests (Container);

-- multiple line items per request. connected to purchasingRequests via requestId
CREATE TABLE ehr_purchasing.lineItems
(
    rowId            serial,
    requestId        entityid,
    item             varchar(500),
    itemUnitId       int,
    controlSubstance boolean default false,
    unitCost         double precision,
    itemStatusId     int,

    LSID             LSIDtype,
    container        ENTITYID NOT NULL,
    createdBy        USERID,
    created          timestamp,
    modifiedBy       USERID,
    modified         timestamp,

    CONSTRAINT PK_EHR_PURCHASING_LINE_ITEMS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId),

    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_REQUEST_ID FOREIGN KEY (requestId) REFERENCES ehr_purchasing.purchasingRequests (requestId),
    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_ITEMUNIT_ID FOREIGN KEY (itemUnitId) REFERENCES ehr_purchasing.itemUnits (rowId),
    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_ITEMSTATUS_ID FOREIGN KEY (itemStatusId) REFERENCES ehr_purchasing.lineItemStatus (rowId)
);

CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEMS_CONTAINER ON ehr_purchasing.lineItems (Container);
CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEMS_REQUEST_ID ON ehr_purchasing.lineItems (requestId);
CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEMS_ITEMUNIT_ID ON ehr_purchasing.lineItems (itemUnitId);
CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEMS_ITEMSTATUS_ID ON ehr_purchasing.lineItems (itemStatusId);

/* 21.xxx SQL scripts */

ALTER TABLE ehr_purchasing.lineItems ADD quantity double precision NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN requestId SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN item SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN itemUnitId SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN unitCost SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems DROP controlSubstance;
ALTER TABLE ehr_purchasing.lineItems ADD controlledSubstance boolean default false;

ALTER TABLE ehr_purchasing.purchasingRequests DROP COLUMN qcStatus;
ALTER TABLE ehr_purchasing.purchasingRequests ADD COLUMN qcState int;
ALTER TABLE ehr_purchasing.purchasingRequests DROP COLUMN account;
ALTER TABLE ehr_purchasing.purchasingRequests ADD account int;
ALTER TABLE ehr_purchasing.purchasingRequests ADD assignedTo USERID NOT NULL;
ALTER TABLE ehr_purchasing.purchasingRequests ADD confirmation varchar;
ALTER TABLE ehr_purchasing.purchasingRequests ADD shippingAttentionTo varchar;  --this value is different per request

ALTER TABLE ehr_purchasing.shippingInfo DROP attentionTo; --this changes per request, so dropping from shippingInfo table and is now added to purchasingRequest table above
ALTER TABLE ehr_purchasing.shippingInfo ADD shippingAlias varchar;
ALTER TABLE ehr_purchasing.shippingInfo ADD streetAddress varchar NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ADD notes varchar;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN city SET NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN state SET NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN country SET NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN zip SET NOT NULL;

ALTER TABLE ehr_purchasing.vendor ADD COLUMN qcState int;
ALTER TABLE ehr_purchasing.vendor ADD faxNumber varchar(50);
ALTER TABLE ehr_purchasing.vendor ADD url varchar;
ALTER TABLE ehr_purchasing.vendor ADD notes varchar;
ALTER TABLE ehr_purchasing.vendor ADD isValidVendor boolean default true;
ALTER TABLE ehr_purchasing.vendor ADD streetAddress varchar NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN vendorName SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN city SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN state SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN country SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN zip SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ADD CONSTRAINT UQ_EHR_PURCHASING_VENDOR_NAME UNIQUE (vendorName);

-- add index on lsid cols
CREATE INDEX IX_EHR_PURCHASING_VENDOR_LSID ON ehr_purchasing.vendor (LSID);
CREATE INDEX IX_EHR_PURCHASING_SHIPPING_INFO_LSID ON ehr_purchasing.shippingInfo (LSID);
CREATE INDEX IX_EHR_PURCHASING_ITEM_UNITS_LSID ON ehr_purchasing.itemUnits (LSID);
CREATE INDEX IX_EHR_PURCHASING_USER_ACCT_ASSOC_LSID ON ehr_purchasing.userAccountAssociations (LSID);
CREATE INDEX IX_EHR_PURCHASING_LINE_ITEM_STATUS_LSID ON ehr_purchasing.lineItemStatus (LSID);
CREATE INDEX IX_EHR_PURCHASING_PURCHASING_REQUESTS_LSID ON ehr_purchasing.purchasingRequests (LSID);
CREATE INDEX IX_EHR_PURCHASING_LINE_ITEMS_LSID ON ehr_purchasing.lineItems (LSID);

DROP INDEX ehr_purchasing.IDX_EHR_PURCHASING_LINE_ITEMS_REQUEST_ID;
ALTER TABLE ehr_purchasing.lineItems DROP CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_REQUEST_ID;
ALTER TABLE ehr_purchasing.lineItems DROP COLUMN requestId;

ALTER TABLE ehr_purchasing.lineItems ADD requestRowId int;
ALTER TABLE ehr_purchasing.lineItems ADD CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_REQUEST_ROW_ID FOREIGN KEY (requestRowId) REFERENCES ehr_purchasing.purchasingRequests (rowId);
CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEMS_REQUEST_ROW_ID ON ehr_purchasing.lineItems (requestRowId);

ALTER TABLE ehr_purchasing.purchasingRequests DROP CONSTRAINT UQ_EHR_PURCHASING_REQUESTS_REQUEST_ID;
ALTER TABLE ehr_purchasing.purchasingRequests DROP COLUMN requestId;

ALTER TABLE ehr_purchasing.userAccountAssociations ADD COLUMN accessToAllAccounts boolean default false;
ALTER TABLE ehr_purchasing.userAccountAssociations DROP CONSTRAINT UQ_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS;
ALTER TABLE ehr_purchasing.userAccountAssociations DROP COLUMN account;
ALTER TABLE ehr_purchasing.userAccountAssociations ADD COLUMN account varchar(200);

ALTER TABLE ehr_purchasing.purchasingRequests DROP assignedTo;
ALTER TABLE ehr_purchasing.purchasingRequests ADD assignedTo USERID;

ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN unitCost TYPE NUMERIC(10, 2);

ALTER TABLE ehr_purchasing.lineItems ADD COLUMN quantityReceived NUMERIC(10, 2) default 0;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN quantity TYPE NUMERIC(10, 2);

ALTER TABLE ehr_purchasing.vendor ALTER COLUMN state DROP NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN zip DROP NOT NULL;

/* 22.xxx SQL scripts */

ALTER TABLE ehr_purchasing.lineItems ADD COLUMN lineItemNumber INTEGER DEFAULT 0 NOT NULL;