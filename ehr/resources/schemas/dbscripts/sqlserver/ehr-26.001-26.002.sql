/*
 * Copyright (c) 2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
-- ehr.Project.Created and ehr.Project.Modified are NULL on SQL Server but NOT NULL on PostgreSQL. Set the NULL values
-- and switch the columns to NOT NULL to match PostgreSQL.
UPDATE ehr.Project SET Created = COALESCE(diCreated, GETDATE()) WHERE Created IS NULL;
UPDATE ehr.Project SET Modified = COALESCE(diModified, GETDATE()) WHERE Modified IS NULL;

ALTER TABLE ehr.Project ALTER COLUMN Created DATETIME NOT NULL;
ALTER TABLE ehr.Project ALTER COLUMN Modified DATETIME NOT NULL;
