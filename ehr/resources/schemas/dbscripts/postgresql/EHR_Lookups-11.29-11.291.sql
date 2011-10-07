/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

alter table ehr_lookups.lab_test_range
  add column type varchar(200)
;

update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'ALB';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'ALKP';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'BUN';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CA';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CHOL';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CL';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CPK';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'CREAT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'FE';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'GGT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'GLUC';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'HCT';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'HGB';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'K';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'LDH';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MCH';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MCHC';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MCV';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'MPV';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'NA';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'PHOS';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'PLT';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'RBC';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'RDW';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'SGOT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'SGPT';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'TB';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'TP';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'TRIG';
update ehr_lookups.lab_test_range set type = 'Chemistry' where test = 'UA';
update ehr_lookups.lab_test_range set type = 'Hematology' where test = 'WBC';
