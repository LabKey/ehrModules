EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER';
GO

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

CREATE INDEX IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER ON ehr_billing.invoice (accountnumber);
GO
