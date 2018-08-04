
-- add some base table columns (i.e. description, dateDisabled, etc.)
ALTER TABLE ehr_lookups.snomed ADD COLUMN description VARCHAR(4000);
ALTER TABLE ehr_lookups.snomed ADD COLUMN dateDisabled TIMESTAMP;
ALTER TABLE ehr_lookups.source ADD COLUMN description VARCHAR(4000);
ALTER TABLE ehr_lookups.species_codes ADD COLUMN genus VARCHAR(255);
ALTER TABLE ehr_lookups.species_codes ADD COLUMN species VARCHAR(255);
ALTER TABLE ehr_lookups.species_codes ADD COLUMN description VARCHAR(4000);
ALTER TABLE ehr_lookups.species_codes ADD COLUMN dateDisabled TIMESTAMP;
ALTER TABLE ehr_lookups.calculated_status_codes ADD COLUMN description VARCHAR(4000);
ALTER TABLE ehr_lookups.cage_type ADD COLUMN description VARCHAR(4000);
ALTER TABLE ehr_lookups.cage_type ADD COLUMN dateDisabled TIMESTAMP;