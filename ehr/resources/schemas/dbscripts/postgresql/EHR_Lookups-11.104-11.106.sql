/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DELETE from ehr_lookups.cageclass;

INSERT INTO ehr_lookups.cageclass
(low, high, sqft, height) VALUES
(0, 1.5, 2.1, 30),
(1.5, 3, 3, 30),
(3, 10, 4.3, 30),
(10, 15, 6, 32),
(15, 20, 8, 36),
(20, 25, 10, 46),
(25, 30, 15, 46),
(30, 100, 25, 60)
;


DELETE from ehr_lookups.obs_mens;

-- ----------------------------
-- Records of obs_mens
-- ----------------------------
INSERT INTO ehr_lookups.obs_mens VALUES ('M', 'Regular Mens');
INSERT INTO ehr_lookups.obs_mens VALUES ('LM', 'Light Mens');
INSERT INTO ehr_lookups.obs_mens VALUES ('HM', 'Heavy Mens');
INSERT INTO ehr_lookups.obs_mens VALUES ('PPM', 'Light after birth bleeding');
INSERT INTO ehr_lookups.obs_mens VALUES ('HPPM', 'Heavy after birth bleeding');

-- ----------------------------
-- Table structure for ehr_lookups.obs_other
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.obs_other;
CREATE TABLE ehr_lookups.obs_other (
code varchar NOT NULL,
meaning varchar DEFAULT NULL,

CONSTRAINT PK_obs_other PRIMARY KEY (code)
)
WITH (OIDS=FALSE)

;


DELETE from ehr_lookups.obs_other;

-- ----------------------------
-- Records of obs_other
-- ----------------------------
INSERT INTO ehr_lookups.obs_other VALUES ('V', 'Vomit');
INSERT INTO ehr_lookups.obs_other VALUES ('NE', 'Not Eating');
INSERT INTO ehr_lookups.obs_other VALUES ('L', 'Lethargic');
INSERT INTO ehr_lookups.obs_other VALUES ('RP', 'Rectal Prolapse');
INSERT INTO ehr_lookups.obs_other VALUES ('VP', 'Vaginal Prolapse');
INSERT INTO ehr_lookups.obs_other VALUES ('N', 'Newborn Infant(s)');
INSERT INTO ehr_lookups.obs_other VALUES ('T', 'Trauma');





DELETE from ehr_lookups.obs_behavior;
-- ----------------------------
-- Records of obs_behavior
-- ----------------------------
INSERT INTO ehr_lookups.obs_behavior VALUES ('NP', 'New pair of animals');
INSERT INTO ehr_lookups.obs_behavior VALUES ('OG', 'Over-groomed animal');
INSERT INTO ehr_lookups.obs_behavior VALUES ('P', 'Pacing');
INSERT INTO ehr_lookups.obs_behavior VALUES ('S', 'Saluting');
INSERT INTO ehr_lookups.obs_behavior VALUES ('F', 'Flipping');
INSERT INTO ehr_lookups.obs_behavior VALUES ('SIB', 'Self-injurious behavior');


DELETE from ehr_lookups.obs_breeding;

INSERT INTO ehr_lookups.obs_breeding VALUES ('E', 'Visible ejaculate');
INSERT INTO ehr_lookups.obs_breeding VALUES ('NOE', 'No visible ejaculate');
INSERT INTO ehr_lookups.obs_breeding VALUES ('N/A', 'N/A');


DELETE from ehr_lookups.obs_feces;

INSERT INTO ehr_lookups.obs_feces VALUES ('SF', 'Soft feces');
INSERT INTO ehr_lookups.obs_feces VALUES ('FS', 'Firm stool');
INSERT INTO ehr_lookups.obs_feces VALUES ('BF', 'Bloody feces');
INSERT INTO ehr_lookups.obs_feces VALUES ('D', 'Diarrhea');
INSERT INTO ehr_lookups.obs_feces VALUES ('WD', 'Watery diarrhea');
INSERT INTO ehr_lookups.obs_feces VALUES ('B', 'Bloody diarrhea');
INSERT INTO ehr_lookups.obs_feces VALUES ('MU', 'Mucus');


INSERT INTO ehr_lookups.restraint_type VALUES ('Chair', '');


INSERT into ehr_lookups.weight_ranges
(species, min_weight, max_weight)
VALUES
('Vervet', 0, 20)
;
