CREATE INDEX IDX_snomed_container_code_rowid ON ehr_lookups.snomed (container, code, rowid);

--stats, sql server only
CREATE STATISTICS STATS_snomed_rowid_container_code ON ehr_lookups.snomed (rowid, container, code);
CREATE STATISTICS STATS_snomed_code_rowid ON ehr_lookups.snomed (code, rowid);
