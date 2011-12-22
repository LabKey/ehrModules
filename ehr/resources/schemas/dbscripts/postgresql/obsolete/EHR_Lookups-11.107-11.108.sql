/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.procedures;
CREATE TABLE ehr_lookups.procedures (
rowid SERIAL,
procedure varchar(255),
code varchar(255),
description varchar(255),

CONSTRAINT PK_procedures PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.encounter_types VALUES ('Biopsy');