/*
 * Copyright (c) 2020 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

-- ehr-17.20-17.21.sql
-- contents of ehr-17.20-17.21.sql script are not in rolled up ehr-0.00-18.10.sql, since they got added and merged after the rollup.
-- So, including it below with a slight variation - add cols only if it doesn't exist since it probably exists on wnprc's postgres db
ALTER TABLE ehr.project ALTER COLUMN Title TYPE VARCHAR(400);

CREATE FUNCTION ehr.handleAddContactToProtocol() RETURNS VOID AS $$
DECLARE
BEGIN
  IF NOT EXISTS (
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='protocol' and table_schema='ehr' and column_name='contacts'
  )
  THEN
    ALTER TABLE ehr.protocol ADD contacts VARCHAR;
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleAddContactToProtocol();

DROP FUNCTION ehr.handleAddContactToProtocol();

DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Started';
DELETE FROM ehr.status WHERE Label = 'Started';

INSERT INTO ehr.qcStateMetadata
    (QCStateLabel,draftData,isDeleted,isRequest)
VALUES
       ('Started', TRUE, FALSE, FALSE);
INSERT INTO ehr.status
    (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES
       ('Started', 'Record has started, but not completed',TRUE,FALSE,FALSE,FALSE,FALSE);


-- ehr-17.21-17.22.sql
-- contents of ehr-17.21-17.22.sql script are not in rolled up ehr-0.00-18.10.sql, since they got added and merged after the rollup.
-- So, including it below with a slight variation - create table only if it doesn't exist since it probably exists on wnprc's postgres db
CREATE FUNCTION ehr.createTable_form_framework_types() RETURNS VOID AS $$
DECLARE
BEGIN
  IF NOT EXISTS(SELECT * FROM pg_tables WHERE tablename = 'form_framework_types' AND schemaname = 'ehr')
  THEN
    CREATE TABLE ehr.form_framework_types (
      RowId SERIAL NOT NULL,

      schemaname varchar(255) DEFAULT NULL,
      queryname varchar(255) DEFAULT NULL,
      framework varchar(255) DEFAULT NULL,

      Container ENTITYID NOT NULL,
      CreatedBy USERID,
      Created TIMESTAMP,
      ModifiedBy USERID,
      Modified TIMESTAMP,

      CONSTRAINT PK_form_framework_types PRIMARY KEY (schemaname, queryname)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr.createTable_form_framework_types();

DROP FUNCTION ehr.createTable_form_framework_types();

CREATE FUNCTION ehr.handleAddSpeciesToSupplementalPedigree() RETURNS VOID AS $$
DECLARE
BEGIN
    IF NOT EXISTS (
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='supplemental_pedigree' and table_schema='ehr' and column_name='species'
        )
    THEN
        ALTER TABLE ehr.supplemental_pedigree ADD species VARCHAR(4000);
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT ehr.handleAddSpeciesToSupplementalPedigree();

DROP FUNCTION ehr.handleAddSpeciesToSupplementalPedigree();
