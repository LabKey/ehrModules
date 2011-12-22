/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


ALTER TABLE ehr_lookups.cage
  ADD column canJoinToNeighbor bool
;


DROP TABLE IF EXISTS ehr_lookups.calculated_status_codes;
CREATE TABLE ehr_lookups.calculated_status_codes (
Code varchar(20) NOT NULL,
Meaning varchar(255) DEFAULT NULL,

CONSTRAINT PK_calculated_status_codes PRIMARY KEY (code)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.calculated_status_codes
 (code)
 VALUES
 ('Alive'),
 ('Dead'),
 ('Shipped'),
 ('No Record'),
 ('ERROR')
 ;