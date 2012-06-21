CREATE TABLE ehr_lookups.cage_type
(
  cagetype varchar(100) not null,
  length double precision,
  width double precision,
  height double precision,
  sqft double precision,

  CONSTRAINT pk_cage_type PRIMARY KEY (cagetype)
);