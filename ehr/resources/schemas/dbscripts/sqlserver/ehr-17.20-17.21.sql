/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

--Merged script from conflicting ehr-12.425-12.426.sql scripts authored in different branches, trunk and modules15.2

ALTER TABLE ehr.protocol ADD contacts VARCHAR(200);

-- Merging upgrade scripts, ensure that we end up with rows for 'Started' in both tables
DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Started';
DELETE FROM ehr.status WHERE Label = 'Started';

INSERT INTO ehr.qcStateMetadata
(QCStateLabel,draftData,isDeleted,isRequest)
VALUES
('Started', 1, 0, 0);
INSERT INTO ehr.status
(label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES
('Started', 'Record has started, but not completed',1,0,0,0,0);