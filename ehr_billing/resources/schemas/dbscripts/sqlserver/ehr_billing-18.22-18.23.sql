ALTER TABLE ehr_billing.chargeRates ALTER COLUMN unitCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceAmount DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentAmountReceived DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN unitCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN totalCost DECIMAL(13,2);
GO
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN unitCost DECIMAL(13,2);
GO