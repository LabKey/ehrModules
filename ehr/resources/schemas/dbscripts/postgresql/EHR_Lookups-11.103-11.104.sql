/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.blood_billed_by;
CREATE TABLE ehr_lookups.blood_billed_by (
code varchar(200),
title varchar(200),

CONSTRAINT PK_blood_billed_by PRIMARY KEY (code)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.blood_billed_by
(code, title) VALUES
('a', 'Animal Care'),
('c', 'CPI'),
('n', 'Neither')
;

DROP TABLE IF EXISTS ehr_lookups.housing_reason;
CREATE TABLE ehr_lookups.housing_reason (
reason varchar(200),

CONSTRAINT PK_housing_reason PRIMARY KEY (reason)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.housing_reason
(reason) VALUES
('Euthanasia/Death of Partner'),
('Departure/Shipment of Partner'),
('Research'),
('Behavior'),
('Clinical'),
('Breeding'),
('Weening'),
('Pair Testing'),
('Other')
;

