-- add LSID column to tables to allow them to be extensible
ALTER TABLE ehr_lookups.species_codes ADD COLUMN lsid LSIDtype;
