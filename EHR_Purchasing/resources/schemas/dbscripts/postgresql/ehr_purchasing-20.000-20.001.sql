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

CREATE INDEX EHR_PURCHASING_CONTAINER_INDEX ON ehr_purchasing.vendor (Container);

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

CREATE INDEX EHR_PURCHASING_SHIPPINGINFO_CONTAINER_INDEX ON ehr_purchasing.shippingInfo (Container);

CREATE TABLE ehr_purchasing.units
(
    rowId           serial,
    unit            varchar(20),
    unitDescription varchar(200),

    LSID            LSIDtype,
    container       ENTITYID NOT NULL,
    createdBy       USERID,
    created         timestamp,
    modifiedBy      USERID,
    modified        timestamp,

    CONSTRAINT PK_EHR_PURCHASING_UNITS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_UNITS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_PURCHASING_UNITS_CONTAINER_INDEX ON ehr_purchasing.units (Container);

-- users associated with ehr_billing.aliases account
CREATE TABLE ehr_purchasing.userAccountAssociations
(
    userId     varchar(20),
    account    varchar(200),

    LSID       LSIDtype,
    container  ENTITYID NOT NULL,
    createdBy  USERID,
    created    timestamp,
    modifiedBy USERID,
    modified   timestamp,

    CONSTRAINT UQ_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS UNIQUE (userId, account),
    CONSTRAINT FK_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_PURCHASING_USER_ACCT_ASSOCIATIONS_CONTAINER_INDEX ON ehr_purchasing.userAccountAssociations (Container);

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
    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEM_STATUS FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_PURCHASING_LINE_ITEM_STATUS_INDEX ON ehr_purchasing.lineItemStatus (Container);

-- multiple line items per request. connected to purchasingRequests via requestId
CREATE TABLE ehr_purchasing.lineItems
(
    rowId      serial,
    requestId  entityid,
    item       varchar(500),
    unitCost   double precision,
    itemStatus int,

    LSID       LSIDtype,
    container  ENTITYID NOT NULL,
    createdBy  USERID,
    created    timestamp,
    modifiedBy USERID,
    modified   timestamp,

    CONSTRAINT PK_EHR_PURCHASING_LINE_ITEMS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_PURCHASING_ITEMS_CONTAINER_INDEX ON ehr_purchasing.lineItems (Container);

-- one row per request. connected to lineItems via requestId
CREATE TABLE ehr_purchasing.purchasingRequests
(
    rowId            int,
    requestId        entityid,
    vendorId         int,
    account          varchar(200),
    controlSubstance boolean default false,
    shippingInfoId   int,
    justification    varchar(1000),
    comments         varchar(1000),
    qcStatus         int,

    LSID             LSIDtype,
    container        ENTITYID NOT NULL,
    createdBy        USERID,
    created          timestamp,
    modifiedBy       USERID,
    modified         timestamp,

    CONSTRAINT PK_EHR_PURCHASING_ITEMS PRIMARY KEY (rowId),
    CONSTRAINT FK_EHR_PURCHASING_REQUESTS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_PURCHASING_REQUESTS_CONTAINER_INDEX ON ehr_purchasing.purchasingRequests (Container);