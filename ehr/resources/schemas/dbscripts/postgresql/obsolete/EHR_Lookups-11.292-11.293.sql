/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



--NOTE: Fix for test failure after improperly editing EHR_lookups-11.2-11.21

-- ----------------------------
-- Table structure for ehr_lookups.routes
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.routes;
CREATE TABLE ehr_lookups.routes (
route varchar(100) NOT NULL,
meaning varchar(200),

CONSTRAINT PK_routes PRIMARY KEY (route)
)
WITH (OIDS=FALSE)

;


-- ----------------------------
-- Records of routes
-- ----------------------------
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IM', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IT', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IV', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IVAG', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('oral', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('rectal', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('SQ', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('topical (eye)', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('topical (skin)', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('topical', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracardiac', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracarotid', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracorneal',	'Intracorneal');
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('intracranial', null);
INSERT INTO ehr_lookups.routes (route, meaning) VALUES ('IP', 'intraperitoneal');