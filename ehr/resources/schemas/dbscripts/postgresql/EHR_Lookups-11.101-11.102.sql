/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


INSERT INTO ehr_lookups.blood_draw_services
(service) VALUES
('Vet-19')
;


DROP TABLE IF EXISTS ehr_lookups.weight_ranges;
CREATE TABLE ehr_lookups.weight_ranges (
species varchar(255),
min_weight float,
max_weight float,

CONSTRAINT PK_weight_ranges PRIMARY KEY (species)
)
WITH (OIDS=FALSE)

;
