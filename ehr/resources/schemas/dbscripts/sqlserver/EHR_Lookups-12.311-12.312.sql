ALTER TABLE ehr_lookups.cage add divider int;
ALTER TABLE ehr_lookups.cage add cage_type varchar(100);

CREATE TABLE ehr_lookups.divider_types (
  rowid int identity(1,1),
  divider varchar(100),
  countAsSeparate bit default 1,

  CONSTRAINT PK_divider_types PRIMARY KEY (rowid)
);

CREATE TABLE ehr_lookups.lookup_sets (
  setname varchar(100),
  label varchar(500),
  description varchar(4000)
);
