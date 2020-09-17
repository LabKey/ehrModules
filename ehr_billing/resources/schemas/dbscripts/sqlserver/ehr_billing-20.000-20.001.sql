-- ehr_billing-18.33-18.34.sql
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceSentComment varchar(500);
GO
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentReceivedComment varchar(500);
GO

-- ehr_billing-18.34-18.35.sql
ALTER TABLE ehr_billing.miscCharges ADD chargeGroup nvarchar(200);
GO

ALTER TABLE ehr_billing.chargeUnits DROP CONSTRAINT PK_chargeUnits;
GO

--rename column chargetype to groupName
-- Note: TNPRC does not have any data in this table, but has two references to chargeUnits where column name rename needs to be updated - 1) in miscCharges.query.xml & 2) TNPRC_BillingCustomizer.java.
EXEC sp_rename 'ehr_billing.chargeUnits.chargetype', 'groupName', 'COLUMN';
GO

ALTER TABLE ehr_billing.chargeUnits ADD CONSTRAINT PK_chargeUnits PRIMARY KEY (groupName);
GO

-- ehr_billing-18.35-18.36.sql
ALTER TABLE ehr_billing.miscCharges ADD totalCost double precision;