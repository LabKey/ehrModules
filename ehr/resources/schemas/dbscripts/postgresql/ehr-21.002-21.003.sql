-- same contents as ehr-20.001-20.002.sql.
-- Rationale: When ehr-20.001-20.002.sql was created, the module version was bumped from 21.001 to 21.002
-- rendering ehr-20.001-20.002.sql useless if the ehr module v. was already at 21.00x in the db.
-- The script should have been numbered ehr-21.001-21.002.sql instead of ehr-20.001-20.002.sql.
-- This script is an correction attempt to get in sync with the ehr module v. 21.00x so that this script runs
-- and below col and constraint gets added as intended.

CREATE FUNCTION ehr.addUrlColToFormFrameworkTypes() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='form_framework_types' and table_schema='ehr' and column_name='url'
        )
    THEN
        ALTER TABLE ehr.form_framework_types ADD url varchar(255) DEFAULT NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr.addUrlColToFormFrameworkTypes();

DROP FUNCTION ehr.addUrlColToFormFrameworkTypes();


CREATE FUNCTION ehr.addConstraintToFormFrameworkTypes() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT constraint_name
            FROM information_schema.table_constraints
            WHERE table_name='form_framework_types' and table_schema='ehr' and constraint_name='ehr_form_framework_types_unique'
        )
    THEN
        ALTER TABLE ehr.form_framework_types ADD CONSTRAINT ehr_form_framework_types_unique UNIQUE (RowId);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr.addConstraintToFormFrameworkTypes();

DROP FUNCTION ehr.addConstraintToFormFrameworkTypes();