/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DELETE FROM ehr_lookups.clinpath_sampletype;

INSERT INTO ehr_lookups.clinpath_sampletype
(sampletype) VALUES
('Bone'),
('Feces'),
('Hair'),
('Blood - Heparinized Whole Blood'),
('Blood - EDTA Whole Blood'),
('Blood - Plasma Lithium Heparin'),
('Blood - Sodium Citrate Whole Blood'),
('Blood - Serum'),
('Blood - Plasma EDTA'),
('Fluid, abdominal'),
('Fluid, thorax'),
('Fluid, uterine'),
('Mass (list tissue/location)'),
('Nail'),
('Skin'),
('Swab - Buccal'),
('Swab - Left Eye'),
('Swab - Right Eye'),
('Swab - Genital'),
('Swab - Rectal'),
('Urine'),
('Vaginal Swab Specimen Collection Kit'),
('Wound/abscess (list tissue/location)')
;


-- ----------------------------
-- Table structure for ehr_lookups.biopsy_type
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.biopsy_type;
CREATE TABLE ehr_lookups.biopsy_type (
type varchar(255) not null,

CONSTRAINT PK_biopsy_type PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of biopsy_type
-- ----------------------------
INSERT INTO ehr_lookups.biopsy_type VALUES ('Clinical');
INSERT INTO ehr_lookups.biopsy_type VALUES ('Experimental');


delete from ehr_lookups.death_manner where manner='Died during experimental procedure';
INSERT INTO ehr_lookups.death_manner (manner) VALUES ('Died during experimental procedure');

