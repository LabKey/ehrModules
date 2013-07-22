ALTER TABLE ehr_lookups.procedures ADD genericName varchar(200);
ALTER TABLE ehr_lookups.procedures ADD incision bool default false;
ALTER TABLE ehr_lookups.procedures ADD recoveryDays integer;
ALTER TABLE ehr_lookups.procedures ADD followupDays integer;

ALTER TABLE ehr_lookups.procedures ADD analgesiaRx integer;
ALTER TABLE ehr_lookups.procedures ADD antibioticRx integer;


