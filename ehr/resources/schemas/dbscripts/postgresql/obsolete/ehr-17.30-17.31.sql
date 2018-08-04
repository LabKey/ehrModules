
-- add LSID column to tables to allow them to be extensible
ALTER TABLE ehr.protocol_counts ADD COLUMN lsid LSIDtype;
ALTER TABLE ehr.snomed_tags ADD COLUMN lsid LSIDtype;