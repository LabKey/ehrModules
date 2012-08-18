/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

/* EHR_Lookups-11.30-11.32.sql */

SELECT setval('ehr_lookups.treatment_frequency_rowid_seq', (select max(rowid) as maxVal from ehr_lookups.treatment_frequency));
SELECT setval('ehr_lookups.ageclass_rowid_seq', (select max(rowid) as maxVal from ehr_lookups.ageclass));

ALTER table ehr_lookups.blood_draw_services
   add column automaticrequestfromblooddraw boolean not null default true;

update ehr_lookups.blood_draw_services
   set automaticrequestfromblooddraw = false where service = 'Viral Load';

/* EHR_Lookups-11.32-11.33.sql */

--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.sample_types;
CREATE TABLE ehr_lookups.sample_types (
type character varying(20) NOT NULL,

CONSTRAINT PK_sample_types PRIMARY KEY (type)
)
WITH (
 OIDS=FALSE
);

INSERT INTO ehr_lookups.sample_types
(type) VALUES
('BAL'),
('FNA'),
('Impression Smear'),
('Skin Scraping')
;

--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.stain_types;
CREATE TABLE ehr_lookups.stain_types (
type character varying(20) NOT NULL,

CONSTRAINT PK_stain_types PRIMARY KEY (type)
)
WITH (
 OIDS=FALSE
);

INSERT INTO ehr_lookups.stain_types 
(type) VALUES
('Gram'),
('Wright''s'),
('Wright-Giemsa'),
('Ziehl-Neelson')
;