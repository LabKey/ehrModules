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