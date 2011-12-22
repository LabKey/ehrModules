/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


delete from ehr_lookups.dental_gingivitis where result = 'No';
INSERT INTO ehr_lookups.dental_gingivitis VALUES ('None', 1);


DROP TABLE IF EXISTS ehr_lookups.virology_method;
CREATE TABLE ehr_lookups.virology_method (
  method varchar(255) NOT NULL,

  CONSTRAINT PK_virology_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)

;

DROP TABLE IF EXISTS ehr_lookups.immunology_method;
CREATE TABLE ehr_lookups.immunology_method (
  method varchar(255) NOT NULL,

  CONSTRAINT PK_immunology_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)

;

DROP TABLE IF EXISTS ehr_lookups.chemistry_method;
CREATE TABLE ehr_lookups.chemistry_method (
  method varchar(255) NOT NULL,

  CONSTRAINT PK_chemistry_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)

;

DROP TABLE IF EXISTS ehr_lookups.virology_method;
CREATE TABLE ehr_lookups.virology_method (
  method varchar(255) NOT NULL,

  CONSTRAINT PK_virology_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)

;

DROP TABLE IF EXISTS ehr_lookups.hematology_method;
CREATE TABLE ehr_lookups.hematology_method (
  method varchar(255) NOT NULL,

  CONSTRAINT PK_hematology_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)

;


DROP TABLE IF EXISTS ehr_lookups.urinalysis_tests;
CREATE TABLE ehr_lookups.urinalysis_tests (
testid varchar(100) NOT NULL,
name varchar(100),
units varchar(100),

CONSTRAINT PK_urinalysis_tests PRIMARY KEY (testid)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.urinalysis_tests VALUES ('BILIRUBIN', 'Bilirubin', 'no units');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('KETONE', 'Ketone', 'mg/dL');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('SP_GRAVITY', 'Specific Gravity', 'no units');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('BLOOD', 'Blood', 'no units');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('PH', 'pH', 'no units');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('PROTEIN', 'Protein', 'mg/dL');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('UROBILINOGEN', 'Urobilinogen', 'E.U./dL');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('NITRITE', 'Nitrite', 'no units');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('LEUKOCYTES', 'Leukocytes', 'no units');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('APPEARANCE', 'Appearance', '');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('GLUC', 'Glucose', 'mg/dL');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('MICROSCOPIC', 'Microscopic', '');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('TURBIDITY', 'Turbidity', '');
INSERT INTO ehr_lookups.urinalysis_tests VALUES ('COLOR', 'Color', '');


DROP TABLE IF EXISTS ehr_lookups.immunology_tests;
CREATE TABLE ehr_lookups.immunology_tests (
testid varchar(100) NOT NULL,
name varchar(100),
units varchar(100),

CONSTRAINT PK_immunology_tests PRIMARY KEY (testid)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.immunology_tests VALUES ('CD20', 'CD20', '');
INSERT INTO ehr_lookups.immunology_tests VALUES ('CD3', 'CD3', '');
INSERT INTO ehr_lookups.immunology_tests VALUES ('CD4', 'CD4', '');
INSERT INTO ehr_lookups.immunology_tests VALUES ('CD8', 'CD8', '');



DROP TABLE IF EXISTS ehr_lookups.chemistry_tests;
CREATE TABLE ehr_lookups.chemistry_tests (
testid varchar(100) NOT NULL,
name varchar(100),
units varchar(100),

CONSTRAINT PK_chemistry_tests PRIMARY KEY (testid)
)
WITH (OIDS=FALSE)
;

INSERT INTO ehr_lookups.chemistry_tests VALUES ('GLUC', 'Glucose', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('BUN', 'Blood urea nitrogen', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('CPK', 'Creatine phosphokinase', 'U/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('CREAT', 'Creatinine', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('CHOL', 'Cholesterol', 'mg/dl');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('TRIG', 'Triglyceride', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('SGOT', 'Serum glutamic oxaloacetic transaminase', 'IU/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('SGPT', 'Serum glutamic pyruvic transaminase', 'IU/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('LDH', 'Lactate dehydrogenase', 'IU/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('LDL', 'Low-Density Lipoprotein', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('GGT', 'Gamma-glutamyltransferase', 'IU/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('TP', 'Total Protein', 'g/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('TB', 'Total Bilirubin', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('ALKP', 'Alkaline Phosphatase', 'IU/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('CA', 'Calcium', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('CL', 'Chloride', 'mEq/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('UA', 'Uric Acid', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('A/P', 'Albumin/Protein Ratio', 'ratio');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('ALB', 'Albumin', 'g/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('B/C', 'BUN/Creatinine Ratio', 'ratio');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('FE', 'Iron', '?g/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('FIBR', 'Fibrinogen', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('HDL', 'High-Density Lipoprotein', 'mg/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('HGB', 'Hemoglobin', 'g/dL');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('K', 'Potassium', 'mmol/L');
INSERT INTO ehr_lookups.chemistry_tests VALUES ('PHOS', 'Phosphorus', 'mg/dL');





DROP TABLE IF EXISTS ehr_lookups.hematology_tests;
CREATE TABLE ehr_lookups.hematology_tests (
testid varchar(100) NOT NULL,
name varchar(100),
units varchar(100),

CONSTRAINT PK_hematology_tests PRIMARY KEY (testid)
)
WITH (OIDS=FALSE)
;



INSERT INTO ehr_lookups.hematology_tests VALUES ('WBC', 'White Blood Cells', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('BANDS', 'Bands', '');
INSERT INTO ehr_lookups.hematology_tests VALUES ('BD', 'Bands??', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('BD-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('BS', 'Basophils', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('BS-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('EO', 'Eosinophils', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('EO-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('PLT', 'Platelets', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('RBC', 'Red Blood Cells', '10^6/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('RDW', 'Red blood cell distribution width', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('RETICULO', 'Reticulocytes', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('LY', 'Lymphocytes', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('LY-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MCH', 'Mean corpuscular hemoglobin', 'picograms');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MCHC', 'Mean corpuscular hemoglobin concentration', 'g/dL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MCV', 'Mean corpuscular volume', 'fL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('METAMYELO', 'Metamyelocytes', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MN', 'Monocytes', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MN-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MPV', 'Mean platelet volume', 'fl');
INSERT INTO ehr_lookups.hematology_tests VALUES ('MYELO', 'Myelocytes', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('NA', 'Sodium', 'mmol/L');
INSERT INTO ehr_lookups.hematology_tests VALUES ('NE', 'Neutrophils', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('NE-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('PCV', 'Packed cell volume', '%');
INSERT INTO ehr_lookups.hematology_tests VALUES ('GLOB', 'Globulin', 'g/dL');
INSERT INTO ehr_lookups.hematology_tests VALUES ('GLYCOSYLATED HGB', 'GLYCOSYLATED HGB', '');
INSERT INTO ehr_lookups.hematology_tests VALUES ('HCT', 'Hematocrit', '%');
