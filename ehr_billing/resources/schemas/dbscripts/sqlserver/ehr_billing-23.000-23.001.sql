ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN creditedaccount nvarchar(200);
GO

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN debitedaccount nvarchar(200);
GO

ALTER TABLE ehr_billing.invoice ALTER COLUMN accountnumber nvarchar(200);
GO

ALTER TABLE ehr_billing.miscCharges ALTER COLUMN creditedaccount nvarchar(200);
GO

ALTER TABLE ehr_billing.miscCharges ALTER COLUMN debitedaccount nvarchar(200);
GO
