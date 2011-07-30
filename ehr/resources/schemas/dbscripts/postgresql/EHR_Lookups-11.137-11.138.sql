/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.booleanCombo;

CREATE TABLE ehr_lookups.booleanCombo
(
  key bool NOT NULL,
  display varchar(20),
  CONSTRAINT pk_booleanCombo PRIMARY KEY (key)
)
WITH (
  OIDS=FALSE
);

insert into ehr_lookups.booleanCombo
(key, display)
 values
(true, 'Yes'),
(false, 'No')
;