CREATE TABLE ehr.protocolexemptions (
  rowid SERIAL,
  protocol VARCHAR(100),
  project INTEGER,
  exemption VARCHAR(200),
  startdate TIMESTAMP,
  enddate TIMESTAMP,
  remark VARCHAR(4000),

  container ENTITYID,
  createdby INTEGER,
  created TIMESTAMP,
  modifiedby INTEGER,
  modified TIMESTAMP,

  CONSTRAINT PK_protocolExemptions PRIMARY KEY (rowid)
);