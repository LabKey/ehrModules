/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


delete from ehr_lookups.encounter_types where type = 'Procedure - Clinical';
delete from ehr_lookups.encounter_types where type = 'Procedure - Training';
delete from ehr_lookups.encounter_types where type = 'Procedure - Experimental';
delete from ehr_lookups.encounter_types where type = 'Procedure - Other';


insert into ehr_lookups.encounter_types
(type) values
('Procedure')
;


DROP TABLE IF EXISTS ehr_lookups.restraint_type;
CREATE TABLE ehr_lookups.restraint_type (
type varchar(255) not null,
code varchar(255),
include bool,

CONSTRAINT PK_restraint_type PRIMARY KEY (type)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of restraint_type
-- ----------------------------
INSERT INTO ehr_lookups.restraint_type (type, code, include) VALUES ('Table-Top', 'w-10238', true);
INSERT INTO ehr_lookups.restraint_type (type, code, include) VALUES ('Tube', '	w-10239', true);
INSERT INTO ehr_lookups.restraint_type (type, code, include) VALUES ('Other', null, true);
INSERT INTO ehr_lookups.restraint_type (type, code, include) VALUES ('Squeeze Back', '', false);
INSERT INTO ehr_lookups.restraint_type (type, code, include) VALUES ('Manual', '', false);
INSERT INTO ehr_lookups.restraint_type (type, code, include) VALUES ('Chemical', '', false);