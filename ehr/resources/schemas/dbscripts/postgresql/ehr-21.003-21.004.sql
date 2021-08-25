DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Request: On Hold';
DELETE FROM ehr.status WHERE Label = 'Request: On Hold';

INSERT INTO ehr.qcStateMetadata
(QCStateLabel, draftData, isDeleted, isRequest, allowFutureDates)
VALUES
('Request: On Hold', FALSE, FALSE, TRUE, TRUE);

INSERT INTO ehr.status
(label, description, publicData, draftData, isDeleted, isRequest, allowFutureDates)
VALUES
('Request: On Hold', 'Request has been put on hold', FALSE, FALSE, FALSE, TRUE, TRUE);
