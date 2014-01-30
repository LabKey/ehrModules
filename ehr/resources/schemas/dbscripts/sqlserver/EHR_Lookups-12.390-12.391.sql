ALTER TABLE ehr_lookups.procedures DROP COLUMN analgesiaRx;
ALTER TABLE ehr_lookups.procedures DROP COLUMN antibioticRx;
GO
ALTER TABLE ehr_lookups.procedures ADD analgesiaRx varchar(200);
ALTER TABLE ehr_lookups.procedures ADD antibioticRx varchar(200);