/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.problem_list_category;
CREATE TABLE ehr_lookups.problem_list_category (
category varchar(200),

CONSTRAINT PK_problem_list_category PRIMARY KEY (category)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.problem_list_category
(category) VALUES
('Trauma')
;

INSERT into ehr_lookups.weight_ranges
(species, min_weight, max_weight)
VALUES
('Marmoset', 0, 1),
('Cynomolgus', 0, 20),
('Rhesus', 0, 35)
;

insert into ehr_lookups.encounter_types
(type) values
('Procedure - Clinical'),
('Procedure - Training')
;