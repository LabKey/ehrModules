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