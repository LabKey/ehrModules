ALTER TABLE ehr_purchasing.lineItems ADD COLUMN quantityReceived NUMERIC(10, 2) default 0;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN quantity TYPE NUMERIC(10, 2);