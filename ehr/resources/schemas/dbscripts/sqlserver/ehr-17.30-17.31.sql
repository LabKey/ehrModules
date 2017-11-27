
-- add LSID column to tables to allow them to be extensible
ALTER TABLE ehr.protocol_counts ADD lsid LsidType;
ALTER TABLE ehr.snomed_tags ADD lsid LsidType;