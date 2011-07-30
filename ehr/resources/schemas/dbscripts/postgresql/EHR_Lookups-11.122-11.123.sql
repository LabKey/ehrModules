/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


delete from ehr_lookups.dental_priority ;

INSERT INTO ehr_lookups.dental_priority
VALUES
('Low', 'No tartar and no gingivitis', 1),
('Low/Medium', 'Mild tartar and no gingivitis.  Mild tartar and very localized gingivitis.', 2),
('Medium', 'Moderate tartar and no gingivitis.  Moderate tartar and very localized gingivitis.  Mild tartar and mild, generalized gingivitis.', 3),
('Medium/High', 'Severe tartar and no gingivitis.  Mild tartar and moderate, generalized gingivitis.  Moderate tartar and mild, generalized gingivitis.', 4),
('High', 'Anything needing extraction.  Severe tartar and generalized gingivitis.', 5)
;


INSERT INTO ehr_lookups.blood_draw_tube_type
(type)
VALUES
('No Additive')
;


DROP TABLE IF EXISTS ehr_lookups.clinpath_collection_method;
CREATE TABLE ehr_lookups.clinpath_collection_method (
method varchar(255) not null,

CONSTRAINT PK_clinpath_collection_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.clinpath_collection_method
(method) VALUES
('Aspirate'),
('Biopsy'),
('Curette'),
('Skin scraping'),
('Swab'),
('Syringe aspirate'),
('Venipuncture')
;


DROP TABLE IF EXISTS ehr_lookups.clinpath_sampletype;
CREATE TABLE ehr_lookups.clinpath_sampletype (
sampletype varchar(255) not null,

CONSTRAINT PK_clinpath_sampletype PRIMARY KEY (sampletype)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.clinpath_sampletype
(sampletype) VALUES
('Abscess, bite wound, or deep wound'),
('Biopsy'),
('Body Fluid'),
('Bone or Tissue'),
('Buccal Swab'),
('Eye Swab - Left'),
('Eye Swab - Right'),
('Ear, eye, skin swab'),
('Feces'),
('Genital Swab'),
('Hair'),
('Heparinized Whole Blood'),
('Lithium Heparin Plasma'),
('Nail'),
('Rectal Swab'),
('Serum'),
('Skin'),
('Sodium Citrate Whole Blood'),
('Soft Tissue Aspirate'),
('Tissue Biopsy'),
('Ulcers (decubitus and nodules)'),
('Urine'),
('Vaginal Swab Specimen Collection Kit'),
('Whole Blood EDTA')
;


alter table ehr_lookups.clinpath_tests
  drop column units,
  add column units varchar(20)
;

INSERT INTO ehr_lookups.clinpath_tests
(testname, dataset) VALUES
('ELISA - HBV', 'Virology'),
('ELISA - SRV', 'Virology'),
('ELISA - SIV', 'Virology'),
('ELISA - STLV-1', 'Virology'),
('ELISA - Measles', 'Virology'),
('PCR - STLV-1', 'Virology'),
('PCR - SRV 1,2,3,4,5', 'Virology'),
('Isolation - HBV', 'Virology'),
('CBC', 'Hematology'),
('Glycosylated Hemoglobin', 'Hematology'),
('Vet-19 Chem Panel', 'Chemistry'),
('Lipid Panel', 'Chemistry'),
('Prothrombin Time (PT) and Activated Partial Thromboplastin Time (APTT)', 'Chemistry'),
('Ova and Parasite Antigen Panel (EIA)', 'Parasitology'),
('Ova and Parasite Concentration (Fecal Float)', 'Parasitology'),
('Ova and Parasite Wet Prep', 'Parasitology'),
('Direct Smear for Protozoa', 'Parasitology'),
('Culture, Enteric', 'Bacteriology'),
('Culture, Bacterial/Smear', 'Bacteriology'),
('Culture, Fungus, Dermal/Smear', 'Bacteriology'),
('Culture, Sterile Fluid/Tissue/Smear', 'Bacteriology'),
('Culture, Urine', 'Bacteriology'),
('Culture, Wound/Smear', 'Bacteriology'),
('Culture, Other', 'Bacteriology'),
('Chlamydia trachomatis Detection by NAA', 'Bacteriology'),
('GIFN for TB detection', 'Bacteriology')
;