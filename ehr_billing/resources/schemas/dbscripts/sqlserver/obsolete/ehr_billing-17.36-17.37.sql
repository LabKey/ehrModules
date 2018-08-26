ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceNumber nvarchar(20);
GO

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN invoiceNumber nvarchar(20);
GO