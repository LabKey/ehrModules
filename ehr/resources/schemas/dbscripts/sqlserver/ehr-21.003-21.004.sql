DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Request: On Hold';
DELETE FROM ehr.status WHERE Label = 'Request: On Hold';

INSERT INTO ehr.qcStateMetadata
(QCStateLabel, draftData, isDeleted, isRequest, allowFutureDates)
VALUES
('Request: On Hold', 0, 0, 1, 1);

INSERT INTO ehr.status
(label, description, publicData, draftData, isDeleted, isRequest, allowFutureDates)
VALUES
('Request: On Hold', 'Request has been put on hold', 0, 0, 0, 1, 1);
