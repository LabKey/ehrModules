/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


-- ----------------------------
-- Table structure for blood_draw_tube_type
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.blood_draw_tube_type;
CREATE TABLE ehr_lookups.blood_draw_tube_type (
type varchar(255) NOT NULL,

CONSTRAINT PK_blood_draw_tube_type PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of blood_draw_tube_type
-- ----------------------------
INSERT INTO ehr_lookups.blood_draw_tube_type
(type)
VALUES
('EDTA'),
('SST'),
('Heparin')
;




