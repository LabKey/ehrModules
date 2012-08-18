/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
CREATE TABLE ehr_lookups.cage_type
(
  cagetype varchar(100) not null,
  length double precision,
  width double precision,
  height double precision,
  sqft double precision,

  CONSTRAINT pk_cage_type PRIMARY KEY (cagetype)
);