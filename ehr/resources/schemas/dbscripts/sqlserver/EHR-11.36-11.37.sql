CREATE TABLE ehr.status
(
  rowid int identity(1,1) NOT NULL,
  label varchar(200) NOT NULL,
  description varchar(4000),
  publicdata bit DEFAULT 0,
  draftdata bit DEFAULT 0,
  isdeleted bit DEFAULT 0,
  isrequest bit DEFAULT 0,
  allowfuturedates bit DEFAULT 0,
  CONSTRAINT pk_status PRIMARY KEY (rowid)
);

INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Completed', 'Record has been completed and is public', 1, 0, 0, 0, 0);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('In Progress', 'Draft Record, not public', 0, 1, 0, 0, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Abnormal', 'Value is abnormal', 1, 0, 0, 0, 0);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Review Required', 'Review is required prior to public release', 0, 1, 0, 0, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Pending', 'Part of a request that has not been approved', 0, 0, 0, 1, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Delete Requested', 'Records are requested to be deleted', 0, 0, 0, 0, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Denied', 'Request has been denied', 0, 0, 0, 1, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Request: Approved', 'Request has been approved', 0, 1, 0, 1, 1);
INSERT INTO ehr.status (label,Description,PublicData,DraftData,isDeleted,isRequest,allowFutureDates) VALUES ('Scheduled', 'Record is scheduled, but not performed', 0, 1, 0, 0, 1);


--drop table ehr.qcstatemetadata;