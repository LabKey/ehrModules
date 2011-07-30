/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.clinpath_types;
CREATE TABLE ehr_lookups.clinpath_types (
type varchar(255) not null,

CONSTRAINT PK_clinpath_types PRIMARY KEY (type)
)
WITH (OIDS=FALSE)
;


INSERT INTO ehr_lookups.clinpath_types
(type) VALUES
('Bacteriology'),
('Chemistry'),
('Hematology'),
('Immunology'),
('Parasitology'),
('Urinalysis'),
('Virology')
;