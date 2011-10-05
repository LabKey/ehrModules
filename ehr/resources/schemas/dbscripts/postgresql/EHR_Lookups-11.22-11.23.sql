/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


alter table ehr_lookups.chemistry_tests
  add column aliases varchar(500)
  ;

UPDATE ehr_lookups.chemistry_tests set aliases = 'GLU' WHERE testid = 'GLUC';
UPDATE ehr_lookups.chemistry_tests set aliases = 'CR' WHERE testid = 'CREAT';
UPDATE ehr_lookups.chemistry_tests set aliases = 'CHO' WHERE testid = 'CHOL';
UPDATE ehr_lookups.chemistry_tests set aliases = 'TRG' WHERE testid = 'TRIG';
UPDATE ehr_lookups.chemistry_tests set aliases = 'AST' WHERE testid = 'SGOT';
UPDATE ehr_lookups.chemistry_tests set aliases = 'BIL' WHERE testid = 'TB';
UPDATE ehr_lookups.chemistry_tests set aliases = 'ALT' WHERE testid = 'SGPT';
UPDATE ehr_lookups.chemistry_tests set aliases = 'ALP' WHERE testid = 'ALKP';
UPDATE ehr_lookups.chemistry_tests set aliases = 'PHO' WHERE testid = 'PHOS';