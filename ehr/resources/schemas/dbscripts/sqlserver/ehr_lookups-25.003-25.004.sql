/*
 * Copyright (c) 2025-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

CREATE TABLE ehr_lookups.editable_lookups
(
    rowid INT IDENTITY(1,1) NOT NULL,
    sch NVARCHAR(255),
    query NVARCHAR(255),
    category NVARCHAR(255),
    title NVARCHAR(255),
    description NVARCHAR(255),
    CONSTRAINT pk_editable_lookups PRIMARY KEY (rowid )
);