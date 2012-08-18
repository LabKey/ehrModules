/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

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

