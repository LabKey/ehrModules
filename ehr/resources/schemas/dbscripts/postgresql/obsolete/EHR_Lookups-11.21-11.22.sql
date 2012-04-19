/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.restraint_duration;
CREATE TABLE ehr_lookups.restraint_duration (
duration varchar(200),
sort_order integer,

CONSTRAINT PK_restraint_duration PRIMARY KEY (duration)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_remarks
-- ----------------------------
INSERT INTO ehr_lookups.restraint_duration (duration, sort_order)
VALUES
('<30 min', 1),
('30-59 min', 2),
('1-12 hours', 3),
('>12 hours', 4)
;



