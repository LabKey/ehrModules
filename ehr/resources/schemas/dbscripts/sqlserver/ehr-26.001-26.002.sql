-- ehr.Project.Created and ehr.Project.Modified are NULL on SQL Server but NOT NULL on PostgreSQL. Set the NULL values
-- and switch the columns to NOT NULL to match PostgreSQL.
UPDATE ehr.Project SET Created = diCreated WHERE Created IS NULL;
UPDATE ehr.Project SET Modified = diModified WHERE Modified IS NULL;

ALTER TABLE ehr.Project ALTER COLUMN Created DATETIME NOT NULL;
ALTER TABLE ehr.Project ALTER COLUMN Modified DATETIME NOT NULL;
