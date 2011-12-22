/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DELETE FROM ehr_lookups.blood_draw_tube_type WHERE type = 'Other';


-- ----------------------------
-- Table structure for ehr_lookups.death_cause
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.death_cause;
CREATE TABLE ehr_lookups.death_cause (
cause varchar(255) not null,

CONSTRAINT PK_death_cause PRIMARY KEY (cause)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of death_codes
-- ----------------------------
INSERT INTO ehr_lookups.death_cause
(cause) VALUES
('Experimental'),
('Other'),
('QX'),
('QC'),
('Quarantine')
;
