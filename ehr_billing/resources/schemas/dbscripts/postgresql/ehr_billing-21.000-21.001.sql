ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN creditedaccount TYPE varchar(200);
ALTER TABLE ehr_billing.invoicedItems ALTER COLUMN debitedaccount TYPE varchar(200);
ALTER TABLE ehr_billing.invoice ALTER COLUMN accountnumber TYPE varchar(200);
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN creditedaccount TYPE varchar(200);
ALTER TABLE ehr_billing.miscCharges ALTER COLUMN debitedaccount TYPE varchar(200);
