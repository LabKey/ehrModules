ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber TYPE varchar(20);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber TYPE varchar(20);