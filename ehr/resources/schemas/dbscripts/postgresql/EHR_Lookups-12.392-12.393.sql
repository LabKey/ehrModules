ALTER TABLE ehr_lookups.treatment_frequency ADD active bool default true;
ALTER TABLE ehr_lookups.treatment_frequency DROP COLUMN legacyname;