/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DELETE FROM ehr_lookups.clinpath_collection_method
WHERE method like '%Biopsy%';

INSERT INTO ehr_lookups.clinpath_collection_method
(method) VALUES
('Biopsy, punch'),
('Biopsy, excisional'),
('Biopsy, needle (true cut)')
;




DELETE FROM ehr_lookups.clinpath_sampletype;

INSERT INTO ehr_lookups.clinpath_sampletype
(sampletype) VALUES
('Bone '),
('Feces '),
('Hair '),
('Blood - Heparinized Whole Blood '),
('Blood - EDTA Whole Blood '),
('Blood - Plasma Lithium Heparin'),
('Blood - Sodium Citrate Whole Blood '),
('Blood - Serum '),
('Blood - Plasma EDTA'),
('Fluid, abdominal'),
('Fluid, thorax'),
('Fluid, uterine'),
('Mass (list tissue/location)'),
('Nail '),
('Skin  '),
('Swab - Buccal '),
('Swab -  left Eye  '),
('Swab - Right Eye '),
('Swab -  Genital'),
('Swab - Rectal'),
('Urine '),
('Vaginal Swab Specimen Collection Kit '),
('Wound/abscess (list tissue/location)')
;

drop table ehr_lookups.clinpath_services;

