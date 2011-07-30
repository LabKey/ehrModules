/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP TABLE IF EXISTS ehr_lookups.tattoo_status;
CREATE TABLE ehr_lookups.tattoo_status (
status varchar(100),

CONSTRAINT PK_tattoo_status PRIMARY KEY (status)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.tattoo_status
(status) VALUES
('Good'),
('Poor'),
('Absent'),
('Done Today')
;


DROP TABLE IF EXISTS ehr_lookups.pe_remarks;
CREATE TABLE ehr_lookups.pe_remarks (
remark varchar(500),

CONSTRAINT PK_pe_remarks PRIMARY KEY (remark)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.pe_remarks
(remark) VALUES
('Physical exam'),
('Physical exam and TB test'),
('Pre-assignment physical exam'),
('Pre-assignment physical exam and TB test')
;

INSERT INTO ehr_lookups.encounter_types
(type) VALUES
('Physical Exam and TB Test'),
('Pre-assignment Physical Exam'),
('Pre-assignment Physical Exam and TB Test')
;
