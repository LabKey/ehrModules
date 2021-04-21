-- ehr_billing-18.33-18.34.sql
ALTER TABLE ehr_billing.invoice ALTER COLUMN invoiceSentComment TYPE varchar(500);
ALTER TABLE ehr_billing.invoice ALTER COLUMN paymentReceivedComment TYPE varchar(500);

-- ehr_billing-18.34-18.35.sql - modified to add if column doesn't already exists
CREATE FUNCTION ehr_billing.addChargeGroupToMiscCharges() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='misccharges' and table_schema='ehr_billing' and column_name='chargegroup'
        )
    THEN
        ALTER TABLE ehr_billing.miscCharges ADD chargeGroup VARCHAR(200);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr_billing.addChargeGroupToMiscCharges();

DROP FUNCTION ehr_billing.addChargeGroupToMiscCharges();

--rename column chargetype to groupName - modified to rename if column exists/not renamed already
CREATE FUNCTION ehr_billing.renameChargeTypeToGroupName() RETURNS VOID AS $$
DECLARE
BEGIN
    IF EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='chargeunits' and table_schema='ehr_billing' and column_name='chargetype'
        )
    THEN
        ALTER TABLE ehr_billing.chargeUnits DROP CONSTRAINT PK_chargeUnits;
        ALTER TABLE ehr_billing.chargeUnits RENAME COLUMN chargetype TO groupName;
        ALTER TABLE ehr_billing.chargeUnits ADD CONSTRAINT PK_chargeUnits PRIMARY KEY (groupName);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr_billing.renameChargeTypeToGroupName();

DROP FUNCTION ehr_billing.renameChargeTypeToGroupName();


-- ehr_billing-18.35-18.36.sql - modified to add if column doesn't already exists
CREATE FUNCTION ehr_billing.addTotalCostToMiscCharges() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='misccharges' and table_schema='ehr_billing' and column_name='totalcost'
        )
    THEN
        ALTER TABLE ehr_billing.miscCharges ADD totalCost double precision;
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr_billing.addTotalCostToMiscCharges();

DROP FUNCTION ehr_billing.addTotalCostToMiscCharges();
