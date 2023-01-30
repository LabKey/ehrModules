ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN creditedaccount varchar(200);
GO

ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN debitedaccount varchar(200);
GO

ALTER TABLE ehr_billing.invoice ALTER COLUMN accountnumber varchar(200);
GO

ALTER TABLE ehr_billing.miscCharges ALTER COLUMN creditedaccount varchar(200);
GO

ALTER TABLE ehr_billing.miscCharges ALTER COLUMN debitedaccount varchar(200);
GO
