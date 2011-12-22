/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


-- ----------------------------
-- Table structure for histology_stain
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.histology_stain;
CREATE TABLE ehr_lookups.histology_stain (
stain varchar(255) not null,

CONSTRAINT PK_histology_stain PRIMARY KEY (stain)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.histology_stain
(stain) VALUES
('Hematoxylin & Eosin'),
('GMS'),
('Trichrome'),
('Gram Stain')
 ;


DROP TABLE IF EXISTS ehr_lookups.bacteriology_method;
CREATE TABLE ehr_lookups.bacteriology_method (
method varchar(255) not null,

CONSTRAINT PK_bacteriology_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.bacteriology_method
(method) VALUES
('EIA')
;


-- ----------------------------
-- Table structure for clinpath_services
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.clinpath_services;
CREATE TABLE ehr_lookups.clinpath_services (
type varchar(255) not null,
category varchar(255) not null,
dataset varchar(255) NOT NULL,
defaultLabware varchar(255),
defaultSource varchar(255),

CONSTRAINT PK_clinpath_services PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.clinpath_services
(type,Category,Dataset,DefaultLabware,DefaultSource)
VALUES
('CBC', 'Hematology', 'Hematology Results', 'purple top', 'blood'),
('Glycosylated Hemoglobin', 'Hematology', 'Hematology Results', 'purple top', 'blood'),
('Hematology Profile', 'Hematology', 'Hematology Results', 'purple top', 'blood'),
('Culture and Sensitivity', 'Bacteriology', 'Bacteriology Results', 'culturette', 'blood'),
('Ova and Parasite Exam (wet preparation)', 'Parasitology', 'Parasitology Results', '', 'feces'),
('Ova and Parasite Exam (concentration)', 'Parasitology', 'Parasitology Results', '', 'feces'),
('Cryptosporidium/Giardia/E. Histolytica EIA', 'Parasitology', 'Parasitology Results', '', 'feces'),
('Trichrome Stain', 'Parasitology', 'Parasitology Results', '', 'feces'),
('Vet 19+ CPK Panel', 'Blood Chemistry', 'Blood Chemistry Results', '3.5mL SST', 'blood'),
('Chemistry - Other', 'Blood Chemistry', 'Blood Chemistry Results', '3.5mL SST', 'blood'),
('SRV', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('STLV-1', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('SIV', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('B-virus', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('EBV', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('CMV', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('RSV', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('SVV', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('SV40', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('Virology - Other', 'Virology', 'Virology Results', '3.5mL SST', 'blood'),
('Urinalysis', 'Urinalysis', 'Urinalysis Results', '', '')
;