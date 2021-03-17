-- contents of ehr-18.32-18.33.sql & ehr-18.33-18.34.sql from wnprc18.3 svn

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