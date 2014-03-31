ALTER TABLE ehr.snomed_tags DROP COLUMN date;
GO
ALTER TABLE ehr.snomed_tags ADD date datetime;
