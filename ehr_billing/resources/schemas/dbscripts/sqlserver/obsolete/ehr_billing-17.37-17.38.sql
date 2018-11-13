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