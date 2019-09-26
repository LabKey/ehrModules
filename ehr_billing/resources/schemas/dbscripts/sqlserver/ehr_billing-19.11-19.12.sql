/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- drop Index and Constraints
EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'INDEX', 'EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX';
GO

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'CONSTRAINT', 'FK_INVOICEDITEMS_INVOICENUM';
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'CONSTRAINT', 'PK_EHR_BILLING_INVOICE_INVNUM';
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'CONSTRAINT', 'UNIQUE_INVOICE_NUM';
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'CONSTRAINT', 'UQ_EHR_BILLING_INVOICE_INVOICENUMBER';
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICENUMBER';
GO

-- Modify invoiceNumber
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber nvarchar(100);
GO

ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber nvarchar(100) NOT NULL;
GO

-- Add Index and Constraints back
CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);
GO

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber);
GO

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
GO

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UQ_EHR_BILLING_INVOICE_INVOICENUMBER UNIQUE (invoicenumber);
GO

CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICENUMBER ON ehr_billing.invoice (invoicenumber);
GO

ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);
GO