/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--to drop:
DROP TABLE ehr_lookups.vl_virus;
DROP TABLE ehr_lookups.vl_technique;
DROP TABLE ehr_lookups.vl_sampletype;
DROP TABLE ehr_lookups.vl_instrument;
DROP TABLE ehr_lookups.vl_category;

DROP TABLE ehr_lookups.booleancombo;

alter table ehr_lookups.dental_teeth alter column teeth TYPE varchar(100);
alter table ehr_lookups.obs_behavior alter column code TYPE varchar(100);

alter table ehr_lookups.obs_breeding alter column code TYPE varchar(100);
alter table ehr_lookups.obs_feces alter column code TYPE varchar(100);
alter table ehr_lookups.obs_mens alter column code TYPE varchar(100);
alter table ehr_lookups.obs_other alter column code TYPE varchar(100);
alter table ehr_lookups.obs_remarks alter column title TYPE varchar(200);
alter table ehr_lookups.obs_tlocation alter column location TYPE varchar(100);

alter table ehr_lookups.obs_behavior alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_breeding alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_feces alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_mens alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_other alter column meaning TYPE varchar(200);
alter table ehr_lookups.obs_remarks alter column remark TYPE varchar(500);