/*
 * Copyright (c) 2025-2026 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

CREATE TABLE ehr_lookups.editable_lookups
(
    rowId SERIAL NOT NULL,
    sch varchar(255),
    query varchar(255),
    category varchar(255),
    title varchar(255),
    description varchar(255),

    CONSTRAINT PK_editable_lookups PRIMARY KEY (rowId)
);