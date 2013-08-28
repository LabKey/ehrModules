CREATE TABLE ehr.protocolexemptions(
  rowid int identity(1,1),
  protocol VARCHAR(100),
  project INTEGER,
  exemption VARCHAR(200),
  startdate DATETIME,
  enddate DATETIME,
  remark VARCHAR(4000),

  container ENTITYID,
  createdby INTEGER,
  created DATETIME ,
  modifiedby INTEGER,
  modified DATETIME,

  CONSTRAINT PK_protocolExemptions PRIMARY KEY (rowid)
);