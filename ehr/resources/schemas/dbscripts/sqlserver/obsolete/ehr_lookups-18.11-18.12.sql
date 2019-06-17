/*
 * Copyright (c) 2018-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

-- add new RowId PK column and per-container unique constraints
ALTER TABLE ehr_lookups.treatment_codes ADD RowId INT IDENTITY(1, 1);
ALTER TABLE ehr_lookups.treatment_codes DROP CONSTRAINT PK_treatment_codes;
ALTER TABLE ehr_lookups.treatment_codes ADD CONSTRAINT PK_treatment_codes PRIMARY KEY (RowId);
ALTER TABLE ehr_lookups.treatment_codes ADD CONSTRAINT UQ_treatment_codes UNIQUE (Container,Meaning);
ALTER TABLE ehr_lookups.buildings ADD RowId INT IDENTITY(1, 1);
ALTER TABLE ehr_lookups.buildings DROP CONSTRAINT PK_buildings;
ALTER TABLE ehr_lookups.buildings ADD CONSTRAINT PK_buildings PRIMARY KEY (RowId);
ALTER TABLE ehr_lookups.buildings ADD CONSTRAINT UQ_buildings UNIQUE (Container,Name);
ALTER TABLE ehr_lookups.rooms ADD RowId INT IDENTITY(1, 1);
ALTER TABLE ehr_lookups.rooms DROP CONSTRAINT PK_rooms;
ALTER TABLE ehr_lookups.rooms ADD CONSTRAINT PK_rooms PRIMARY KEY (RowId);
ALTER TABLE ehr_lookups.rooms ADD CONSTRAINT UQ_rooms UNIQUE (Container,Room);
ALTER TABLE ehr_lookups.cage DROP CONSTRAINT PK_cage;
ALTER TABLE ehr_lookups.cage ADD CONSTRAINT PK_cage PRIMARY KEY (RowId);
ALTER TABLE ehr_lookups.cage ADD CONSTRAINT UQ_cage UNIQUE (Container,Location);
ALTER TABLE ehr_lookups.cage_type ADD RowId INT IDENTITY(1, 1);
ALTER TABLE ehr_lookups.cage_type DROP CONSTRAINT PK_cage_type;
ALTER TABLE ehr_lookups.cage_type ADD CONSTRAINT PK_cage_type PRIMARY KEY (RowId);
ALTER TABLE ehr_lookups.cage_type ADD CONSTRAINT UQ_cage_type UNIQUE (Container,CageType);
GO