
DROP INDEX ehr_lookups_set_name_value ON ehr_lookups.lookups;

ALTER TABLE ehr_lookups.lookups ALTER COLUMN set_name NVARCHAR(100);
ALTER TABLE ehr_lookups.lookups ALTER COLUMN value NVARCHAR(200);
ALTER TABLE ehr_lookups.lookups ALTER COLUMN title NVARCHAR(200);
ALTER TABLE ehr_lookups.lookups ALTER COLUMN description NVARCHAR(1000);
ALTER TABLE ehr_lookups.lookups ALTER COLUMN category NVARCHAR(200);

ALTER TABLE ehr_lookups.lookup_sets ALTER COLUMN setname NVARCHAR(100);
ALTER TABLE ehr_lookups.lookup_sets ALTER COLUMN label NVARCHAR(500);
ALTER TABLE ehr_lookups.lookup_sets ALTER COLUMN description NVARCHAR(4000);
ALTER TABLE ehr_lookups.lookup_sets ALTER COLUMN keyField NVARCHAR(100);
ALTER TABLE ehr_lookups.lookup_sets ALTER COLUMN titleColumn NVARCHAR(100);
GO

CREATE UNIQUE INDEX ehr_lookups_set_name_value_container ON ehr_lookups.lookups (set_name, value, container)