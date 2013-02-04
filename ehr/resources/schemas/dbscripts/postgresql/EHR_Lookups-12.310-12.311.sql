alter table ehr_lookups.rooms add column dateDisabled timestamp;
alter table ehr_lookups.rooms drop column category;
alter table ehr_lookups.areas add column dateDisabled timestamp;
