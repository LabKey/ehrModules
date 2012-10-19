DELETE FROM ehr.qcStateMetadata WHERE QCStateLabel = 'Request: Complete';
INSERT INTO ehr.qcStateMetadata
(QCStateLabel,DraftData,isDeleted,isRequest,allowFutureDates)
VALUES ('Request: Complete', 0, 0, 1, 1);