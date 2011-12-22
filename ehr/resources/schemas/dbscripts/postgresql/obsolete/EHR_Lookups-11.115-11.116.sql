/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr_lookups.qualitative_results;
CREATE TABLE ehr_lookups.qualitative_results (
result varchar(255) not null,

CONSTRAINT PK_qualitative_results PRIMARY KEY (result)
)
WITH (OIDS=FALSE)

;

INSERT INTO ehr_lookups.qualitative_results
(result) VALUES
('Positive'),
('Negative'),
('Indeterminate')
 ;


DROP TABLE IF EXISTS ehr_lookups.urine_method;
-- ----------------------------
-- Table structure for urinalysis_method
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.urinalysis_method;
CREATE TABLE ehr_lookups.urinalysis_method (
  method varchar(255) NOT NULL,

  CONSTRAINT PK_urinalysis_method PRIMARY KEY (method)
)
WITH (OIDS=FALSE)

;


INSERT INTO ehr_lookups.urinalysis_method
(method)
VALUES
('Void'),
('Catheter'),
('Cysto'),
('Free catch'),
('Cysti'),
('CC'),
('From pan')
;



DROP TABLE IF EXISTS ehr_lookups.virology_tests;
CREATE TABLE ehr_lookups.virology_tests (
testid varchar(255) not null,

CONSTRAINT PK_virology_tests PRIMARY KEY (testid)
)
WITH (OIDS=FALSE)

;