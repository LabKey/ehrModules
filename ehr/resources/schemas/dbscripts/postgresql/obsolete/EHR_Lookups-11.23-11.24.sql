/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.drug_categories;
CREATE TABLE ehr_lookups.drug_categories (
category varchar(200),

CONSTRAINT PK_drug_categories PRIMARY KEY (category)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.drug_categories
(category) VALUES
('Treatments'),
('Surgery Medication'),
('Surgery Anesthesia'),
('Procedure'),
('Surgery Fluid'),
('Hormone'),
('Drug')
;


alter table ehr_lookups.condition_codes
  add column min integer,
  add column max integer
  ;


DELETE FROM ehr_lookups.condition_codes;

INSERT INTO ehr_lookups.condition_codes
(code, meaning, min, max) VALUES
('am', 'with adopted mother', 2, null),
('b', 'breeding', 2, null),
('c', 'chair', 1, 1),
('f', 'with the father', 2, null),
('g', 'in a group (+3 animals living together)', 3, null),
('gam', 'in a group with adopted mother', 3, null),
('gf', 'in a group with father', 3, null),
('gm', 'in a group with the mother', 3, null),
('gmf', 'in a group with the mother and father', 3, null),
('m', 'with the mother', 2, null),
('p', 'paired', 2, null),
('pc', 'protected contact paired', 1, null),
('s', 'single', 1, 1),
('x', 'special housing condition', 1, 1),
('gaf', 'in a group with adopted father', 3, null),
('mgaf', 'in a group with mother and adopted father', 3, null),
('gb', 'group breeding', 3, null),
('gmaf', 'in a group with the mother and adopted father', 3, null),
('xs', 'special housing from single', 1, 1)
;



DROP TABLE IF EXISTS ehr_lookups.usda_codes;
CREATE TABLE ehr_lookups.usda_codes (
rowid serial not null,
code varchar(100),
category varchar(100),
usda_letter varchar(10),
include_previous bool default false,

CONSTRAINT PK_usda_codes PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.full_snomed;
CREATE TABLE ehr_lookups.full_snomed (
code varchar(255) NOT NULL,
meaning varchar(2000),

-- Container ENTITYID,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_full_snomed PRIMARY KEY (code)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.snomap;
CREATE TABLE ehr_lookups.snomap (
rowid serial not null,
ocode varchar(255) NOT NULL,
ncode varchar(255) NOT NULL,
meaning varchar(2000),
date timestamp,
objectid ENTITYID NOT NULL,

CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_snomap PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.chow_types;
CREATE TABLE ehr_lookups.chow_types (
type varchar(200),

CONSTRAINT PK_chow_types PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;


DELETE FROM ehr_lookups.snomed_qualifiers where qualifier in (
'right cranial lobe',
'right middle lobe',
'right caudal lobe',
'left cranial lobe',
'left middle lobe',
'left caudal lobe',
'accessory lobe'
);

INSERT into ehr_lookups.snomed_qualifiers (qualifier) VALUES
('right cranial lobe'),
('right middle lobe'),
('right caudal lobe'),
('left cranial lobe'),
('left middle lobe'),
('left caudal lobe'),
('accessory lobe')
;





alter table ehr_lookups.clinpath_tests
  add column alertOnAbnormal bool default false,
  add column alertOnComplete bool default false
;
