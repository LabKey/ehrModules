CREATE TABLE ehr.treatment_times (
  rowid serial,
  treatmentid entityid,
  time int,

  objectid entityid,
  container entityid,
  created timestamp,
  createdby int,
  modified timestamp,
  modifiedby int,

  constraint PK_teatment_times PRIMARY KEY (rowid)
);
