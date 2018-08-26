ALTER TABLE ehr_billing.invoice DROP CONSTRAINT PK_EHR_BILLING_INVOICE;
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber SET NOT NULL;
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT PK_EHR_BILLING_INVOICE_INVNUM PRIMARY KEY (invoiceNumber);

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber SET NOT NULL;

ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UNIQUE_INVOICE_NUM UNIQUE (invoiceNumber);
ALTER TABLE ehr_billing.invoicedItems ADD CONSTRAINT FK_INVOICEDITEMS_INVOICENUM FOREIGN KEY (invoiceNumber) REFERENCES ehr_billing.invoice (invoiceNumber);

CREATE INDEX EHR_BILLING_INVOICEDITEMS_INVNUM_INDEX ON ehr_billing.invoicedItems (invoiceNumber);