/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.tissue_recipients;
CREATE TABLE ehr_lookups.tissue_recipients (
recipient varchar(255) not null,

CONSTRAINT PK_tissue_recipients PRIMARY KEY (recipient)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.tissue_recipients
(recipient) VALUES
('PI'),
('Pathologist'),
('NHPBMD'),
('Other')
 ;


INSERT INTO ehr_lookups.death_codes VALUES ('d-clin', 'Death - Clinical');


DROP TABLE IF EXISTS ehr_lookups.parasitology_method;
CREATE TABLE ehr_lookups.parasitology_method (
method varchar(255) not null,

CONSTRAINT PK_parasitology_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.parasitology_method
(method) VALUES
('EIA'),
('Ova and Parasite Exam (Wet Prep)'),
('Ova and Parasite Exam (Concentration)'),
('Direct Smear')
;

INSERT INTO ehr_lookups.parasitology_method
(method) VALUES
('PCR'),
('Culture')
;

INSERT INTO ehr_lookups.blood_draw_services
(service) VALUES
('Viral Load')
;
