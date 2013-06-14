DELETE FROM ehr_lookups.snomed_subsets WHERE subset = 'Diet';
INSERT INTO ehr_lookups.snomed_subsets (subset) VALUES ('Diet');