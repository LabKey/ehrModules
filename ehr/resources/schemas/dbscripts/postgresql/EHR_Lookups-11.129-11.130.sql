/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP TABLE IF EXISTS ehr_lookups.blood_tube_volumes;
CREATE TABLE ehr_lookups.blood_tube_volumes (
volume float,
tube_types varchar(100),

CONSTRAINT PK_blood_tube_volumes PRIMARY KEY (volume)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.blood_tube_volumes
(tube_types, volume) VALUES
('EDTA', 0.5),
('EDTA', 2),
('SST', 3.5),
('SST', 5),
('Heparin', 4),
('EDTA,Heparin', 6)
;

