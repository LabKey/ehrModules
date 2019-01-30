ALTER TABLE ehr_billing.invoice ADD balanceDue DECIMAL(13,2);
GO

ALTER TABLE ehr_billing.miscCharges ADD investigator nvarchar(100);
GO