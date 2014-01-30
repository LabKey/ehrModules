ALTER TABLE ehr_lookups.treatment_frequency ADD active bit default 1;
ALTER TABLE ehr_lookups.treatment_frequency DROP COLUMN legacyname;