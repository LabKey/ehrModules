ALTER TABLE ehr_lookups.flag_categories ADD omitFromOverview bit default 0;
ALTER TABLE ehr_lookups.flag_categories ADD doHighlight bit default 0;
GO
INSERT INTO ehr_lookups.flag_categories (category, enforceUnique, omitFromOverview) values ('Genetics', 0, 1);
UPDATE ehr_lookups.flag_categories set doHighlight = 0;
UPDATE ehr_lookups.flag_categories set doHighlight = 1 WHERE category = 'Alert';