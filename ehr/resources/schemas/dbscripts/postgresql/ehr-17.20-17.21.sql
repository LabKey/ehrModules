/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

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