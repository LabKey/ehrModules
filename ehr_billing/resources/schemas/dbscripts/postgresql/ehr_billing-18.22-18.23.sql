ALTER TABLE ehr_billing.chargeRates ALTER COLUMN unitCost TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceAmount TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentAmountReceived TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN unitCost TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN totalCost TYPE DECIMAL(13,2);
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN unitCost TYPE DECIMAL(13,2);
