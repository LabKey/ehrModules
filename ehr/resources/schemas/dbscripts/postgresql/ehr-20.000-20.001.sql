/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- ehr-17.20-17.21.sql script is getting skipped on teamcity since it got merged to this (wnprc18.3) branch after rolled up scripts ehr-17.20-17.30, and its siblings ehr-17.21-17.30 & ehr-17.22-17.30 were created.
-- So adding the contents of ehr-17.20-17.21.sql script below:

--Merged script from conflicting ehr-12.425-12.426.sql scripts authored in different branches, trunk and modules15.2

-- Ensure column length is changed as expected
ALTER TABLE ehr.project ALTER COLUMN Title TYPE VARCHAR(400);

-- Make sure the ehr.protocol table has a contact column
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

-- Merging upgrade scripts, ensure that we end up with rows for 'Started' in both tables
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


-- ehr-17.21-17.22.sql script is getting skipped on teamcity (same reason as mentioned above).
-- So adding the contents of ehr-17.21-17.22.sql script below with a slight variation - i.e. create table only if it doesn't exist:

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