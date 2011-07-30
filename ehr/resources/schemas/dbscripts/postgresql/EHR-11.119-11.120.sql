/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



ALTER TABLE ehr.tasks
    add column datecompleted timestamp
;


ALTER table ehr.qcStateMetadata
  add column allowFutureDates bool
;

DELETE from ehr.qcStateMetadata;

INSERT INTO ehr.qcStateMetadata
(QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES
('Approved', FALSE, FALSE, FALSE, FALSE),
('In Progress', TRUE, FALSE, FALSE, TRUE),
('Abnormal', FALSE, FALSE, FALSE, FALSE),
('Review Required', FALSE, FALSE, FALSE, TRUE),
('Request: Pending', FALSE, FALSE, TRUE, TRUE),
('Delete Requested', TRUE, FALSE, FALSE, TRUE),
('Deleted', FALSE, TRUE, FALSE, TRUE),
('Request: Denied', FALSE, FALSE, TRUE, TRUE),
('Request: Approved', TRUE, FALSE, TRUE, TRUE),
('Request: Complete', FALSE, FALSE, TRUE, TRUE),
('Scheduled', TRUE, FALSE, FALSE, TRUE)
;
