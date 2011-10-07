/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

alter table ehr_lookups.lab_tests
  add column alertOnAbnormal bool default true,
  add column categories varchar(200),
  add column sort_order integer
;



alter table ehr_lookups.clinpath_tests
  drop column alertOnAbnormal
;


alter table ehr_lookups.usda_codes
  add column keyword varchar(255)
;


alter table ehr_lookups.chemistry_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;

alter table ehr_lookups.hematology_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false
  --add column sort_order integer
;

alter table ehr_lookups.immunology_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;

alter table ehr_lookups.urinalysis_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;

alter table ehr_lookups.virology_tests
  add column alertOnAbnormal bool default true,
  add column alertOnAny bool default false,
  add column includeInPanel bool default false,
  add column sort_order integer
;


update ehr_lookups.hematology_tests set sort_order = 1, includeInPanel=true where testid = 'WBC';
update ehr_lookups.hematology_tests set sort_order = 2, includeInPanel=true where testid = 'RBC';
update ehr_lookups.hematology_tests set sort_order = 3, includeInPanel=true where testid = 'HGB';
update ehr_lookups.hematology_tests set sort_order = 4, includeInPanel=true where testid = 'HCT';
update ehr_lookups.hematology_tests set sort_order = 5, includeInPanel=true where testid = 'MCV';
update ehr_lookups.hematology_tests set sort_order = 6, includeInPanel=true where testid = 'MCH';
update ehr_lookups.hematology_tests set sort_order = 7, includeInPanel=true where testid = 'MCHC';
update ehr_lookups.hematology_tests set sort_order = 8, includeInPanel=true where testid = 'RDW';
update ehr_lookups.hematology_tests set sort_order = 9, includeInPanel=true where testid = 'PLT';
update ehr_lookups.hematology_tests set sort_order = 10, includeInPanel=true where testid = 'MPV';
update ehr_lookups.hematology_tests set sort_order = 11, includeInPanel=true where testid = 'PCV';
update ehr_lookups.hematology_tests set sort_order = 12, includeInPanel=true where testid = 'NE';
update ehr_lookups.hematology_tests set sort_order = 13, includeInPanel=true where testid = 'LY';
update ehr_lookups.hematology_tests set sort_order = 14, includeInPanel=true where testid = 'MN';
update ehr_lookups.hematology_tests set sort_order = 15, includeInPanel=true where testid = 'EO';
update ehr_lookups.hematology_tests set sort_order = 16, includeInPanel=true where testid = 'BS';
update ehr_lookups.hematology_tests set sort_order = 17, includeInPanel=true where testid = 'BANDS';
update ehr_lookups.hematology_tests set sort_order = 18, includeInPanel=true where testid = 'METAMYELO';
update ehr_lookups.hematology_tests set sort_order = 19, includeInPanel=true where testid = 'MYELO';
update ehr_lookups.hematology_tests set sort_order = 20, includeInPanel=true where testid = 'TP';
update ehr_lookups.hematology_tests set sort_order = 21, includeInPanel=true where testid = 'RETICULO';
update ehr_lookups.hematology_tests set sort_order = 22, includeInPanel=true where testid = 'PRO MYELO';
update ehr_lookups.hematology_tests set sort_order = 23, includeInPanel=true where testid = 'ATYL LYMPH';
update ehr_lookups.hematology_tests set sort_order = 24, includeInPanel=true where testid = 'OTHER';


update ehr_lookups.chemistry_tests set sort_order = 1, includeInPanel=true where testid = 'GLUC';
update ehr_lookups.chemistry_tests set sort_order = 2, includeInPanel=true where testid = 'BUN';
update ehr_lookups.chemistry_tests set sort_order = 3, includeInPanel=true where testid = 'CREAT';
update ehr_lookups.chemistry_tests set sort_order = 4, includeInPanel=true where testid = 'CPK';
update ehr_lookups.chemistry_tests set sort_order = 5, includeInPanel=true where testid = 'CHOL';
update ehr_lookups.chemistry_tests set sort_order = 6, includeInPanel=true where testid = 'TRIG';
update ehr_lookups.chemistry_tests set sort_order = 7, includeInPanel=true where testid = 'SGOT';
update ehr_lookups.chemistry_tests set sort_order = 8, includeInPanel=true where testid = 'LDL';
update ehr_lookups.chemistry_tests set sort_order = 9, includeInPanel=true where testid = 'LDH';
update ehr_lookups.chemistry_tests set sort_order = 10, includeInPanel=true where testid = 'TB';
update ehr_lookups.chemistry_tests set sort_order = 11, includeInPanel=true where testid = 'GGT';
update ehr_lookups.chemistry_tests set sort_order = 12, includeInPanel=true where testid = 'SGPT';
update ehr_lookups.chemistry_tests set sort_order = 13, includeInPanel=true where testid = 'TP';
update ehr_lookups.chemistry_tests set sort_order = 14, includeInPanel=true where testid = 'ALB';
update ehr_lookups.chemistry_tests set sort_order = 15, includeInPanel=true where testid = 'ALKP';
update ehr_lookups.chemistry_tests set sort_order = 16, includeInPanel=true where testid = 'CA';
update ehr_lookups.chemistry_tests set sort_order = 17, includeInPanel=true where testid = 'PHOS';
update ehr_lookups.chemistry_tests set sort_order = 18, includeInPanel=true where testid = 'FE';
update ehr_lookups.chemistry_tests set sort_order = 19, includeInPanel=true where testid = 'NA';
update ehr_lookups.chemistry_tests set sort_order = 20, includeInPanel=true where testid = 'K';
update ehr_lookups.chemistry_tests set sort_order = 21, includeInPanel=true where testid = 'L';
update ehr_lookups.chemistry_tests set sort_order = 22, includeInPanel=true where testid = 'UA';

update ehr_lookups.immunology_tests set sort_order = 1, includeInPanel=true where testid = 'CD3';
update ehr_lookups.immunology_tests set sort_order = 2, includeInPanel=true where testid = 'CD20';
update ehr_lookups.immunology_tests set sort_order = 3, includeInPanel=true where testid = 'CD4';
update ehr_lookups.immunology_tests set sort_order = 4, includeInPanel=true where testid = 'CD8';

update ehr_lookups.urinalysis_tests set sort_order = 1, includeInPanel=true where testid = 'BILIRUBIN';
update ehr_lookups.urinalysis_tests set sort_order = 2, includeInPanel=true where testid = 'KETONE';
update ehr_lookups.urinalysis_tests set sort_order = 3, includeInPanel=true where testid = 'SP_GRAVITY';
update ehr_lookups.urinalysis_tests set sort_order = 4, includeInPanel=true where testid = 'BLOOD';
update ehr_lookups.urinalysis_tests set sort_order = 5, includeInPanel=true where testid = 'PH';
update ehr_lookups.urinalysis_tests set sort_order = 6, includeInPanel=true where testid = 'PROTEIN';
update ehr_lookups.urinalysis_tests set sort_order = 7, includeInPanel=true where testid = 'UROBILINOGEN';
update ehr_lookups.urinalysis_tests set sort_order = 8, includeInPanel=true where testid = 'NITRITE';
update ehr_lookups.urinalysis_tests set sort_order = 9, includeInPanel=true where testid = 'LEUKOCYTES';
update ehr_lookups.urinalysis_tests set sort_order = 10, includeInPanel=true where testid = 'APPEARANCE';
update ehr_lookups.urinalysis_tests set sort_order = 11, includeInPanel=true where testid = 'MICROSCOPIC';
update ehr_lookups.urinalysis_tests set sort_order = 12, includeInPanel=true where testid = 'GLUCOSE';





drop table if exists ehr_lookups.lab_tests;