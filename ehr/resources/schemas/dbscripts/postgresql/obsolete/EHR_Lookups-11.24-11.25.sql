/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

alter table ehr_lookups.hematology_tests
  add column sort_order integer
;


DROP TABLE IF EXISTS ehr_lookups.tissue_distribution;
CREATE TABLE ehr_lookups.tissue_distribution (
location varchar(100),

CONSTRAINT PK_tissue_distribution PRIMARY KEY (location)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.tissue_distribution
(location) VALUES
('NHPBMD'),
('NIA Tissue Bank')
;


INSERT INTO ehr_lookups.snomed_qualifiers
(qualifier) VALUES
('rostral'),
('caudal'),
('upper'),
('lower'),
('cranial'),
('lateral'),
('descending'),
('ascending'),
('portion'),
('head'),
('tail'),
('endo'),
('exo'),
('anterior'),
('posterior')
;

delete from ehr_lookups.death_manner where manner = 'Other';

insert into ehr_lookups.death_manner (manner) values ('Died in utero');

insert into ehr_lookups.preservation_solutions
(solution) values
('0.9% saline')
;


DROP TABLE IF EXISTS ehr_lookups.container_types;
CREATE TABLE ehr_lookups.container_types (
type varchar(100),

CONSTRAINT PK_container_types PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.container_types
(type) VALUES
('Cryotube'),
('15ml Conical Tube'),
('50ml Conical Tube')
;

update ehr_lookups.hematology_tests set sort_order = 1 where testid = 'WBC';
update ehr_lookups.hematology_tests set sort_order = 2 where testid = 'RBC';
update ehr_lookups.hematology_tests set sort_order = 3 where testid = 'HGB';
update ehr_lookups.hematology_tests set sort_order = 4 where testid = 'HCT';
update ehr_lookups.hematology_tests set sort_order = 5 where testid = 'MCV';
update ehr_lookups.hematology_tests set sort_order = 6 where testid = 'MCH';
update ehr_lookups.hematology_tests set sort_order = 7 where testid = 'MCHC';
update ehr_lookups.hematology_tests set sort_order = 8 where testid = 'RDW';
update ehr_lookups.hematology_tests set sort_order = 9 where testid = 'PLT';
update ehr_lookups.hematology_tests set sort_order = 10 where testid = 'MPV';
update ehr_lookups.hematology_tests set sort_order = 11 where testid = 'PCV';
update ehr_lookups.hematology_tests set sort_order = 12 where testid = 'NE';
update ehr_lookups.hematology_tests set sort_order = 13 where testid = 'LY';
update ehr_lookups.hematology_tests set sort_order = 14 where testid = 'MN';
update ehr_lookups.hematology_tests set sort_order = 15 where testid = 'EO';
update ehr_lookups.hematology_tests set sort_order = 16 where testid = 'BS';
update ehr_lookups.hematology_tests set sort_order = 17 where testid = 'BANDS';
update ehr_lookups.hematology_tests set sort_order = 18 where testid = 'METAMYELO';
update ehr_lookups.hematology_tests set sort_order = 19 where testid = 'MYELO';
update ehr_lookups.hematology_tests set sort_order = 20 where testid = 'TP';
update ehr_lookups.hematology_tests set sort_order = 21 where testid = 'RETICULO';
update ehr_lookups.hematology_tests set sort_order = 22 where testid = 'PRO MYELO';
update ehr_lookups.hematology_tests set sort_order = 23 where testid = 'ATYL LYMPH';
update ehr_lookups.hematology_tests set sort_order = 24 where testid = 'OTHER';