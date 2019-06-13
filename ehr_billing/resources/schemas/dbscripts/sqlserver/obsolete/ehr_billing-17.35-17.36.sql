/*
 * Copyright (c) 2018-2019 LabKey Corporation
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