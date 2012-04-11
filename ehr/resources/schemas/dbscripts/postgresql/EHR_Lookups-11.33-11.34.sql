/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--drop/recreate table
DROP TABLE IF EXISTS ehr_lookups.cytology_tests;
CREATE TABLE ehr_lookups.cytology_tests (
testid character varying(100) NOT NULL,
"name" character varying(100),
units character varying(100),
sort_order integer,
alertonabnormal boolean DEFAULT true,
alertonany boolean DEFAULT false,
includeinpanel boolean DEFAULT false,
CONSTRAINT PK_cytology_tests PRIMARY KEY (testid)
)
WITH (
 OIDS=FALSE
);

INSERT INTO ehr_lookups.cytology_tests
(testid, name, units, sort_order) VALUES
('BS', 'Basophils', '%', 15),
('EO', 'Eosinophils', '%', 14),
('HCT', 'Hematocrit', '%', 4),
('HGB', 'Hemoglobin', 'g/dL', 3),
('LY', 'Lymphocytes', '%', 12),
('MCH', 'Mean Corpuscular Hemoglobin', 'pg', 6),
('MCHC', 'Mean Corpuscular Hemoglobin Concentration', 'g/dL', 7),
('MCV', 'Mean Corpuscular Volume', 'fL', 10),
('MN', 'Monocytes', '%', 13),
('MPV', 'Mean Platelet Volume', 'fL', 10),
('NE', 'Neutrophils', '%', 11),
('PLT', 'Platelet', '10^3/uL', 9),
('RBC', 'Red Blood Cells', '10^6/uL', 2),
('RDW-CV', 'Red Blood Cell Distribution Width - Coefficient Variation', '%', 8),
('WBC', 'White Blood Cells', '10^3/uL', 1)
;