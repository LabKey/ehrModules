--Added new column called "PainCategories" to record the USDA pain levels.
--EHR tkt # 8782
ALTER TABLE ehr_lookups.procedures ADD PainCategories varchar(50);