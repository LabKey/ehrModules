SELECT core.fn_dropifexists('*', 'ehr', 'SCHEMA', NULL);

CREATE SCHEMA ehr;


DROP TABLE IF EXISTS ehr.module_properties;
CREATE TABLE ehr.module_properties (
    RowId SERIAL NOT NULL PRIMARY KEY,

    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP
);

DROP TABLE IF EXISTS ehr.snomed_mapping;
CREATE TABLE ehr.snomed_mapping
(
    RowId SERIAL NOT NULL PRIMARY KEY,
    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    record character varying(32),
    snomed character varying(32)

);

DROP TABLE IF EXISTS ehr.tasks;
CREATE TABLE ehr.tasks
(
    TaskId ENTITYID NOT NULL PRIMARY KEY,
    type character varying(100)
    QCState integer,
    AssignedTo USERID NOT NULL,
    DueDate TIMESTAMP NOT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    Description TEXT

);

-- ----------------------------
-- Table structure for ageclass
-- ----------------------------
DROP TABLE IF EXISTS ehr.ageclass;
CREATE TABLE ehr.ageclass (
species varchar(255),
ageclass int2 DEFAULT NULL,
min float,
max float,
RowId SERIAL PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of ageclass
-- ----------------------------
INSERT INTO ehr.ageclass VALUES ('Marmoset', '3', '2', '8', '1');
INSERT INTO ehr.ageclass VALUES ('Marmoset', '4', '8', null, '2');
INSERT INTO ehr.ageclass VALUES ('Marmoset', '1', '0', '1', '3');
INSERT INTO ehr.ageclass VALUES ('Marmoset', '2', '1', '2', '4');
INSERT INTO ehr.ageclass VALUES ('Rhesus', '2', '1', '4', '5');
INSERT INTO ehr.ageclass VALUES ('Rhesus', '1', '0', '1', '6');
INSERT INTO ehr.ageclass VALUES ('Rhesus', '3', '4', '20', '7');
INSERT INTO ehr.ageclass VALUES ('Rhesus', '4', '20', null, '8');
INSERT INTO ehr.ageclass VALUES ('Cynomolgus', '3', '5', null, '9');

-- ----------------------------
-- Table structure for alopecia_area
-- ----------------------------
DROP TABLE IF EXISTS ehr.alopecia_area;
CREATE TABLE ehr.alopecia_area (
area varchar(4000) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of alopecia_area
-- ----------------------------
INSERT INTO ehr.alopecia_area VALUES ('Generalized');
INSERT INTO ehr.alopecia_area VALUES ('Head');

-- ----------------------------
-- Table structure for alopecia_cause
-- ----------------------------
DROP TABLE IF EXISTS ehr.alopecia_cause;
CREATE TABLE ehr.alopecia_cause (
cause varchar(4000) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of alopecia_cause
-- ----------------------------
INSERT INTO ehr.alopecia_cause VALUES ('Behavioral');
INSERT INTO ehr.alopecia_cause VALUES ('Medical');
INSERT INTO ehr.alopecia_cause VALUES ('Both');
INSERT INTO ehr.alopecia_cause VALUES ('Unknown');


-- ----------------------------
-- Table structure for ehr.alopecia_score
-- ----------------------------
DROP TABLE IF EXISTS ehr.alopecia_score;
CREATE TABLE ehr.alopecia_score (
score int4  PRIMARY KEY NOT NULL,
meaning varchar(250) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of alopecia_score
-- ----------------------------
INSERT INTO ehr.alopecia_score VALUES ('0', 'Good haircoat');
INSERT INTO ehr.alopecia_score VALUES ('1', 'Thinning of haircoat, without alopecia');
INSERT INTO ehr.alopecia_score VALUES ('2', 'Few (1-3) small (less than 3cm in diameter) patches of alopecia.');
INSERT INTO ehr.alopecia_score VALUES ('3', '1-2 large (greater than 3cm in diameter) or numerous (> 3) small patches.  *One portion of limb (ie. upper arm, lower leg) is equivalent to large patch');
INSERT INTO ehr.alopecia_score VALUES ('4', 'Greater than 2 large patches or generalized alopecia');
INSERT INTO ehr.alopecia_score VALUES ('5', 'More than 90% of body completely bald');



-- ----------------------------
-- Table structure for arearooms
-- ----------------------------
DROP TABLE IF EXISTS ehr.arearooms;
CREATE TABLE ehr.arearooms (
RowId serial PRIMARY KEY NOT NULL,
area varchar(20) NOT NULL,
room varchar(20) NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of arearooms
-- ----------------------------
INSERT INTO ehr.arearooms VALUES ('1', 'SPF', 'ab10');
INSERT INTO ehr.arearooms VALUES ('2', 'SPF', 'ab11');
INSERT INTO ehr.arearooms VALUES ('3', 'SPF', 'ab12');
INSERT INTO ehr.arearooms VALUES ('4', 'NSPF', 'ab14');
INSERT INTO ehr.arearooms VALUES ('5', 'NSPF', 'ab16');
INSERT INTO ehr.arearooms VALUES ('6', 'A1/AB190', 'a1');
INSERT INTO ehr.arearooms VALUES ('7', 'A1/AB190', 'ab190');
INSERT INTO ehr.arearooms VALUES ('8', 'A2', 'a2');
INSERT INTO ehr.arearooms VALUES ('9', 'CB', 'cb');
INSERT INTO ehr.arearooms VALUES ('10', 'C3', 'c3');
INSERT INTO ehr.arearooms VALUES ('11', 'C4', 'c4');
INSERT INTO ehr.arearooms VALUES ('12', 'WIMR', 'mr');
INSERT INTO ehr.arearooms VALUES ('13', 'Chamany', 'cif');

-- ----------------------------
-- Table structure for areas
-- ----------------------------
DROP TABLE IF EXISTS ehr.areas;
CREATE TABLE ehr.areas (
area varchar(20) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of areas
-- ----------------------------
INSERT INTO ehr.areas VALUES ('Charmany');
INSERT INTO ehr.areas VALUES ('NSPF');
INSERT INTO ehr.areas VALUES ('SPF');
INSERT INTO ehr.areas VALUES ('A2');
INSERT INTO ehr.areas VALUES ('CB');
INSERT INTO ehr.areas VALUES ('C3');
INSERT INTO ehr.areas VALUES ('C4');
INSERT INTO ehr.areas VALUES ('WIMR');
INSERT INTO ehr.areas VALUES ('A1/AB190');

-- ----------------------------
-- Table structure for bacteriology_sensitivity
-- ----------------------------
DROP TABLE IF EXISTS ehr.bacteriology_sensitivity;
CREATE TABLE ehr.bacteriology_sensitivity (
code varchar(4000) PRIMARY KEY NOT NULL,
meaning varchar(4000) 
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of bacteriology_sensitivity
-- ----------------------------
INSERT INTO ehr.bacteriology_sensitivity VALUES ('i', null);
INSERT INTO ehr.bacteriology_sensitivity VALUES ('r', 'Resistant');
INSERT INTO ehr.bacteriology_sensitivity VALUES ('s', 'Sensitive');


-- ----------------------------
-- Table structure for ehr.bcs_score
-- ----------------------------
DROP TABLE IF EXISTS ehr.bcs_score;
CREATE TABLE ehr.bcs_score (
score float8  PRIMARY KEY NOT NULL,
meaning varchar(250) DEFAULT NULL::character varying,
description varchar(500) DEFAULT NULL::character varying
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of bcs_score
-- ----------------------------
INSERT INTO ehr.bcs_score VALUES ('1', 'Emaciated', null);
INSERT INTO ehr.bcs_score VALUES ('1.5', 'Very Thin', null);
INSERT INTO ehr.bcs_score VALUES ('2', 'Thin', null);
INSERT INTO ehr.bcs_score VALUES ('2.5', 'Lean', null);
INSERT INTO ehr.bcs_score VALUES ('3', 'Optimum', null);
INSERT INTO ehr.bcs_score VALUES ('4', 'Heavy', null);
INSERT INTO ehr.bcs_score VALUES ('4.5', 'Obese', null);
INSERT INTO ehr.bcs_score VALUES ('5', 'Grossly Obese', null);




-- ----------------------------
-- Table structure for behavior_category
-- ----------------------------
DROP TABLE IF EXISTS ehr.behavior_category;
CREATE TABLE ehr.behavior_category (
category varchar(4000) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of behavior_category
-- ----------------------------
INSERT INTO ehr.behavior_category VALUES ('Abnormal: SIB');
INSERT INTO ehr.behavior_category VALUES ('Abnormal: Stereotypy');
INSERT INTO ehr.behavior_category VALUES ('Social: Pairings');
INSERT INTO ehr.behavior_category VALUES ('Social: Separations');
INSERT INTO ehr.behavior_category VALUES ('Social: Monitoring');
INSERT INTO ehr.behavior_category VALUES ('Other');

-- ----------------------------
-- Table structure for birth_type
-- ----------------------------
DROP TABLE IF EXISTS ehr.birth_type;
CREATE TABLE ehr.birth_type (
type varchar(45) PRIMARY KEY  NOT NULL,
meaning text
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of birth_type
-- ----------------------------
INSERT INTO ehr.birth_type VALUES ('c', null);
INSERT INTO ehr.birth_type VALUES ('n', null);
INSERT INTO ehr.birth_type VALUES ('o', null);


-- ----------------------------
-- Table structure for ehr.cage
-- ----------------------------
DROP TABLE IF EXISTS ehr.cage;
CREATE TABLE ehr.cage (
roomcage varchar(24) PRIMARY KEY NOT NULL,
room varchar(8) DEFAULT NULL,
cage varchar(8) DEFAULT NULL,
length float8 DEFAULT NULL,
width float8 DEFAULT NULL,
height float8 DEFAULT NULL,
ts timestamp(6) DEFAULT NULL,
uuid char(36) DEFAULT NULL,
RowId SERIAL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of cage
-- ----------------------------
INSERT INTO ehr.cage VALUES ('-', '', '', '0', '0', '0', null, null, '1');
INSERT INTO ehr.cage VALUES ('a140a-0001', 'a140a', '0001', '24', '36', '72', null, null, '2');
INSERT INTO ehr.cage VALUES ('a140a-0002', 'a140a', '0002', '24', '36', '72', null, null, '3');
INSERT INTO ehr.cage VALUES ('a140a-0003', 'a140a', '0003', '24', '36', '72', null, null, '4');
INSERT INTO ehr.cage VALUES ('a140a-0004', 'a140a', '0004', '24', '36', '72', null, null, '5');
INSERT INTO ehr.cage VALUES ('a140a-0005', 'a140a', '0005', '24', '36', '72', null, null, '6');
INSERT INTO ehr.cage VALUES ('a140a-0006', 'a140a', '0006', '24', '36', '72', null, null, '7');
INSERT INTO ehr.cage VALUES ('a140a-0011', 'a140a', '0011', '24', '24', '72', null, null, '8');
INSERT INTO ehr.cage VALUES ('a140a-0012', 'a140a', '0012', '24', '24', '72', null, null, '9');
INSERT INTO ehr.cage VALUES ('a140a-0013', 'a140a', '0013', '24', '36', '72', null, null, '10');
INSERT INTO ehr.cage VALUES ('a140a-0014', 'a140a', '0014', '24', '36', '72', null, null, '11');
INSERT INTO ehr.cage VALUES ('a140a-0015', 'a140a', '0015', '24', '36', '72', null, null, '12');
INSERT INTO ehr.cage VALUES ('a140a-0016', 'a140a', '0016', '24', '36', '72', null, null, '13');
INSERT INTO ehr.cage VALUES ('a142-0001', 'a142', '0001', '24', '24', '72', null, null, '14');
INSERT INTO ehr.cage VALUES ('a142-0002', 'a142', '0002', '24', '24', '72', null, null, '15');
INSERT INTO ehr.cage VALUES ('a142-0003', 'a142', '0003', '24', '24', '72', null, null, '16');
INSERT INTO ehr.cage VALUES ('a142-0004', 'a142', '0004', '24', '24', '72', null, null, '17');
INSERT INTO ehr.cage VALUES ('a142-0005', 'a142', '0005', '24', '24', '72', null, null, '18');
INSERT INTO ehr.cage VALUES ('a142-0006', 'a142', '0006', '24', '24', '72', null, null, '19');
INSERT INTO ehr.cage VALUES ('a142-0007', 'a142', '0007', '24', '36', '72', null, null, '20');
INSERT INTO ehr.cage VALUES ('a142-0008', 'a142', '0008', '24', '36', '72', null, null, '21');
INSERT INTO ehr.cage VALUES ('a142-0009', 'a142', '0009', '24', '36', '72', null, null, '22');
INSERT INTO ehr.cage VALUES ('a142-0010', 'a142', '0010', '24', '36', '72', null, null, '23');
INSERT INTO ehr.cage VALUES ('a142-0018', 'a142', '0018', '24', '24', '72', null, null, '24');
INSERT INTO ehr.cage VALUES ('a142-0019', 'a142', '0019', '24', '24', '72', null, null, '25');
INSERT INTO ehr.cage VALUES ('a142-0020', 'a142', '0020', '24', '36', '72', null, null, '26');
INSERT INTO ehr.cage VALUES ('a142-0021', 'a142', '0021', '24', '36', '72', null, null, '27');
INSERT INTO ehr.cage VALUES ('a142-0022', 'a142', '0022', '24', '36', '72', null, null, '28');
INSERT INTO ehr.cage VALUES ('a142-0023', 'a142', '0023', '24', '36', '72', null, null, '29');
INSERT INTO ehr.cage VALUES ('a142-0024', 'a142', '0024', '24', '24', '72', null, null, '30');
INSERT INTO ehr.cage VALUES ('a142-0025', 'a142', '0025', '24', '24', '72', null, null, '31');
INSERT INTO ehr.cage VALUES ('a142-0026', 'a142', '0026', '24', '36', '72', null, null, '32');
INSERT INTO ehr.cage VALUES ('a144a-0001', 'a144a', '0001', '24', '36', '72', null, null, '33');
INSERT INTO ehr.cage VALUES ('a144a-0002', 'a144a', '0002', '24', '36', '72', null, null, '34');
INSERT INTO ehr.cage VALUES ('a144a-0003', 'a144a', '0003', '24', '36', '72', null, null, '35');
INSERT INTO ehr.cage VALUES ('a144a-0004', 'a144a', '0004', '24', '36', '72', null, null, '36');
INSERT INTO ehr.cage VALUES ('a144a-0005', 'a144a', '0005', '24', '36', '72', null, null, '37');
INSERT INTO ehr.cage VALUES ('a144a-0006', 'a144a', '0006', '24', '36', '72', null, null, '38');
INSERT INTO ehr.cage VALUES ('a144a-0011', 'a144a', '0011', '24', '24', '72', null, null, '39');
INSERT INTO ehr.cage VALUES ('a144a-0012', 'a144a', '0012', '24', '24', '72', null, null, '40');
INSERT INTO ehr.cage VALUES ('a144a-0013', 'a144a', '0013', '24', '36', '72', null, null, '41');
INSERT INTO ehr.cage VALUES ('a144a-0014', 'a144a', '0014', '24', '36', '72', null, null, '42');
INSERT INTO ehr.cage VALUES ('a144a-0015', 'a144a', '0015', '24', '36', '72', null, null, '43');
INSERT INTO ehr.cage VALUES ('a144a-0016', 'a144a', '0016', '24', '36', '72', null, null, '44');
INSERT INTO ehr.cage VALUES ('a158-0001', 'a158', '0001', '31', '31.25', '33', null, null, '45');
INSERT INTO ehr.cage VALUES ('a158-0002', 'a158', '0002', '31', '31.25', '33', null, null, '46');
INSERT INTO ehr.cage VALUES ('a158-0003', 'a158', '0003', '31', '31.25', '33', null, null, '47');
INSERT INTO ehr.cage VALUES ('a158-0004', 'a158', '0004', '31', '31.25', '33', null, null, '48');
INSERT INTO ehr.cage VALUES ('a158-0005', 'a158', '0005', '31', '31.25', '33', null, null, '49');
INSERT INTO ehr.cage VALUES ('a158-0006', 'a158', '0006', '31', '31.25', '33', null, null, '50');
INSERT INTO ehr.cage VALUES ('a158-0007', 'a158', '0007', '31', '31.25', '33', null, null, '51');
INSERT INTO ehr.cage VALUES ('a158-0008', 'a158', '0008', '31', '31.25', '33', null, null, '52');
INSERT INTO ehr.cage VALUES ('a158-0009', 'a158', '0009', '31', '31.25', '33', null, null, '53');
INSERT INTO ehr.cage VALUES ('a158-0010', 'a158', '0010', '31', '31.25', '33', null, null, '54');
INSERT INTO ehr.cage VALUES ('a158-0011', 'a158', '0011', '31', '31.25', '33', null, null, '55');
INSERT INTO ehr.cage VALUES ('a158-0012', 'a158', '0012', '31', '31.25', '33', null, null, '56');
INSERT INTO ehr.cage VALUES ('a158-0013', 'a158', '0013', '31', '31.25', '33', null, null, '57');
INSERT INTO ehr.cage VALUES ('a158-0014', 'a158', '0014', '31', '31.25', '33', null, null, '58');
INSERT INTO ehr.cage VALUES ('a158-0015', 'a158', '0015', '31', '31.25', '33', null, null, '59');
INSERT INTO ehr.cage VALUES ('a158-0016', 'a158', '0016', '31', '31.25', '33', null, null, '60');
INSERT INTO ehr.cage VALUES ('a161a-pen1', 'a161a', 'pen1', '122', '52', '98.5', null, null, '61');
INSERT INTO ehr.cage VALUES ('a161c-pen1', 'a161c', 'pen1', '122', '52', '98.5', null, null, '62');
INSERT INTO ehr.cage VALUES ('a163a-0001', 'a163a', '0001', '24', '36', '72', null, null, '63');
INSERT INTO ehr.cage VALUES ('a163a-0002', 'a163a', '0002', '24', '36', '72', null, null, '64');
INSERT INTO ehr.cage VALUES ('a163a-0003', 'a163a', '0003', '24', '36', '72', null, null, '65');
INSERT INTO ehr.cage VALUES ('a163a-0004', 'a163a', '0004', '24', '36', '72', null, null, '66');
INSERT INTO ehr.cage VALUES ('a163a-0005', 'a163a', '0005', '24', '24', '72', null, null, '67');
INSERT INTO ehr.cage VALUES ('a163a-0013', 'a163a', '0013', '24', '36', '72', null, null, '68');
INSERT INTO ehr.cage VALUES ('a163a-0014', 'a163a', '0014', '24', '36', '72', null, null, '69');
INSERT INTO ehr.cage VALUES ('a164-0001', 'a164', '0001', '24', '36', '72', null, null, '70');
INSERT INTO ehr.cage VALUES ('a164-0002', 'a164', '0002', '24', '36', '72', null, null, '71');
INSERT INTO ehr.cage VALUES ('a164-0003', 'a164', '0003', '24', '36', '72', null, null, '72');
INSERT INTO ehr.cage VALUES ('a164-0004', 'a164', '0004', '24', '36', '72', null, null, '73');
INSERT INTO ehr.cage VALUES ('a164-0005', 'a164', '0005', '24', '36', '72', null, null, '74');
INSERT INTO ehr.cage VALUES ('a164-0006', 'a164', '0006', '24', '36', '72', null, null, '75');
INSERT INTO ehr.cage VALUES ('a164-0007', 'a164', '0007', '24', '36', '72', null, null, '76');
INSERT INTO ehr.cage VALUES ('a164-0008', 'a164', '0008', '24', '36', '72', null, null, '77');
INSERT INTO ehr.cage VALUES ('a164-0009', 'a164', '0009', '24', '36', '72', null, null, '78');
INSERT INTO ehr.cage VALUES ('a164-0010', 'a164', '0010', '24', '36', '72', null, null, '79');
INSERT INTO ehr.cage VALUES ('a165-0001', 'a165', '0001', '24', '36', '72', null, null, '80');
INSERT INTO ehr.cage VALUES ('a165-0002', 'a165', '0002', '24', '36', '72', null, null, '81');
INSERT INTO ehr.cage VALUES ('a165-0003', 'a165', '0003', '24', '36', '72', null, null, '82');
INSERT INTO ehr.cage VALUES ('a165-0004', 'a165', '0004', '24', '36', '72', null, null, '83');
INSERT INTO ehr.cage VALUES ('a165-0005', 'a165', '0005', '24', '36', '72', null, null, '84');
INSERT INTO ehr.cage VALUES ('a165-0006', 'a165', '0006', '24', '36', '72', null, null, '85');
INSERT INTO ehr.cage VALUES ('a165-0007', 'a165', '0007', '24', '36', '72', null, null, '86');
INSERT INTO ehr.cage VALUES ('a165-0008', 'a165', '0008', '24', '36', '72', null, null, '87');
INSERT INTO ehr.cage VALUES ('a165-0009', 'a165', '0009', '24', '36', '72', null, null, '88');
INSERT INTO ehr.cage VALUES ('a165-0017', 'a165', '0017', '24', '36', '72', null, null, '89');
INSERT INTO ehr.cage VALUES ('a165-0018', 'a165', '0018', '24', '36', '72', null, null, '90');
INSERT INTO ehr.cage VALUES ('a165-0019', 'a165', '0019', '24', '36', '72', null, null, '91');
INSERT INTO ehr.cage VALUES ('a165-0020', 'a165', '0020', '24', '36', '72', null, null, '92');
INSERT INTO ehr.cage VALUES ('a165-0021', 'a165', '0021', '24', '36', '72', null, null, '93');
INSERT INTO ehr.cage VALUES ('a165-0022', 'a165', '0022', '24', '36', '72', null, null, '94');
INSERT INTO ehr.cage VALUES ('a165-0023', 'a165', '0023', '24', '36', '72', null, null, '95');
INSERT INTO ehr.cage VALUES ('a165-0024', 'a165', '0024', '24', '36', '72', null, null, '96');
INSERT INTO ehr.cage VALUES ('a165-0025', 'a165', '0025', '24', '36', '72', null, null, '97');
INSERT INTO ehr.cage VALUES ('a165-0026', 'a165', '0026', '24', '36', '72', null, null, '98');
INSERT INTO ehr.cage VALUES ('a242-0001', 'a242', '0001', '31', '31.25', '33', null, null, '99');
INSERT INTO ehr.cage VALUES ('a242-0002', 'a242', '0002', '31', '31.25', '33', null, null, '100');
INSERT INTO ehr.cage VALUES ('a242-0003', 'a242', '0003', '31', '31.25', '33', null, null, '101');
INSERT INTO ehr.cage VALUES ('a242-0004', 'a242', '0004', '31', '31.25', '33', null, null, '102');
INSERT INTO ehr.cage VALUES ('a242-0005', 'a242', '0005', '33', '40.5', '37.5', null, null, '103');
INSERT INTO ehr.cage VALUES ('a242-0006', 'a242', '0006', '33', '40.5', '37.5', null, null, '104');
INSERT INTO ehr.cage VALUES ('a242-0007', 'a242', '0007', '33', '40.5', '37.5', null, null, '105');
INSERT INTO ehr.cage VALUES ('a242-0008', 'a242', '0008', '33', '40.5', '37.5', null, null, '106');
INSERT INTO ehr.cage VALUES ('a242-0009', 'a242', '0009', '31', '31.25', '33', null, null, '107');
INSERT INTO ehr.cage VALUES ('a242-0010', 'a242', '0010', '31', '31.25', '33', null, null, '108');
INSERT INTO ehr.cage VALUES ('a242-0011', 'a242', '0011', '31', '31.25', '33', null, null, '109');
INSERT INTO ehr.cage VALUES ('a242-0012', 'a242', '0012', '31', '31.25', '33', null, null, '110');
INSERT INTO ehr.cage VALUES ('a242-0013', 'a242', '0013', '31', '31.25', '33', null, null, '111');
INSERT INTO ehr.cage VALUES ('a242-0014', 'a242', '0014', '31', '31.25', '33', null, null, '112');
INSERT INTO ehr.cage VALUES ('a242-0015', 'a242', '0015', '31', '31.25', '33', null, null, '113');
INSERT INTO ehr.cage VALUES ('a242-0016', 'a242', '0016', '31', '31.25', '33', null, null, '114');
INSERT INTO ehr.cage VALUES ('a242-0017', 'a242', '0017', '31', '31.25', '33', null, null, '115');
INSERT INTO ehr.cage VALUES ('a242-0018', 'a242', '0018', '31', '31.25', '33', null, null, '116');
INSERT INTO ehr.cage VALUES ('a242-0019', 'a242', '0019', '31', '31.25', '33', null, null, '117');
INSERT INTO ehr.cage VALUES ('a242-0020', 'a242', '0020', '31', '31.25', '33', null, null, '118');
INSERT INTO ehr.cage VALUES ('a244a-0001', 'a244a', '0001', '31', '31.25', '33', null, null, '119');
INSERT INTO ehr.cage VALUES ('a244a-0002', 'a244a', '0002', '31', '31.25', '33', null, null, '120');
INSERT INTO ehr.cage VALUES ('a244a-0003', 'a244a', '0003', '31', '31.25', '33', null, null, '121');
INSERT INTO ehr.cage VALUES ('a244a-0004', 'a244a', '0004', '31', '31.25', '33', null, null, '122');
INSERT INTO ehr.cage VALUES ('a244a-0005', 'a244a', '0005', '31', '31.25', '33', null, null, '123');
INSERT INTO ehr.cage VALUES ('a244a-0006', 'a244a', '0006', '31', '31.25', '33', null, null, '124');
INSERT INTO ehr.cage VALUES ('a244a-0007', 'a244a', '0007', '31', '31.25', '33', null, null, '125');
INSERT INTO ehr.cage VALUES ('a244a-0008', 'a244a', '0008', '31', '31.25', '33', null, null, '126');
INSERT INTO ehr.cage VALUES ('a244a-0009', 'a244a', '0009', '31', '31.25', '33', null, null, '127');
INSERT INTO ehr.cage VALUES ('a244a-0010', 'a244a', '0010', '31', '31.25', '33', null, null, '128');
INSERT INTO ehr.cage VALUES ('a244a-0011', 'a244a', '0011', '31', '31.25', '33', null, null, '129');
INSERT INTO ehr.cage VALUES ('a244a-0012', 'a244a', '0012', '31', '31.25', '33', null, null, '130');
INSERT INTO ehr.cage VALUES ('a244a-0013', 'a244a', '0013', '31', '31.25', '33', null, null, '131');
INSERT INTO ehr.cage VALUES ('a244a-0014', 'a244a', '0014', '31', '31.25', '33', null, null, '132');
INSERT INTO ehr.cage VALUES ('a244a-0015', 'a244a', '0015', '31', '31.25', '33', null, null, '133');
INSERT INTO ehr.cage VALUES ('a244a-0016', 'a244a', '0016', '31', '31.25', '33', null, null, '134');
INSERT INTO ehr.cage VALUES ('a244b-0001', 'a244b', '0001', '31', '31.25', '33', null, null, '135');
INSERT INTO ehr.cage VALUES ('a244b-0002', 'a244b', '0002', '31', '31.25', '33', null, null, '136');
INSERT INTO ehr.cage VALUES ('a244b-0003', 'a244b', '0003', '24', '28', '30', null, null, '137');
INSERT INTO ehr.cage VALUES ('a244b-0004', 'a244b', '0004', '24', '28', '30', null, null, '138');
INSERT INTO ehr.cage VALUES ('a244b-0005', 'a244b', '0005', '24', '28', '30', null, null, '139');
INSERT INTO ehr.cage VALUES ('a244b-0006', 'a244b', '0006', '24', '28', '30', null, null, '140');
INSERT INTO ehr.cage VALUES ('a244b-0007', 'a244b', '0007', '31', '31.25', '33', null, null, '141');
INSERT INTO ehr.cage VALUES ('a244b-0008', 'a244b', '0008', '31', '31.25', '33', null, null, '142');
INSERT INTO ehr.cage VALUES ('a244b-0009', 'a244b', '0009', '31', '31.25', '33', null, null, '143');
INSERT INTO ehr.cage VALUES ('a244b-0010', 'a244b', '0010', '31', '31.25', '33', null, null, '144');
INSERT INTO ehr.cage VALUES ('a244b-0011', 'a244b', '0011', '31', '31.25', '33', null, null, '145');
INSERT INTO ehr.cage VALUES ('a244b-0012', 'a244b', '0012', '31', '31.25', '33', null, null, '146');
INSERT INTO ehr.cage VALUES ('a244b-0013', 'a244b', '0013', '31', '31.25', '33', null, null, '147');
INSERT INTO ehr.cage VALUES ('a244b-0014', 'a244b', '0014', '31', '31.25', '33', null, null, '148');
INSERT INTO ehr.cage VALUES ('a246-0001', 'a246', '0001', '31', '31.25', '33', null, null, '149');
INSERT INTO ehr.cage VALUES ('a246-0002', 'a246', '0002', '31', '31.25', '33', null, null, '150');
INSERT INTO ehr.cage VALUES ('a246-0003', 'a246', '0003', '31', '31.25', '33', null, null, '151');
INSERT INTO ehr.cage VALUES ('a246-0004', 'a246', '0004', '31', '31.25', '33', null, null, '152');
INSERT INTO ehr.cage VALUES ('a246-0005', 'a246', '0005', '31', '31.25', '33', null, null, '153');
INSERT INTO ehr.cage VALUES ('a246-0006', 'a246', '0006', '31', '31.25', '33', null, null, '154');
INSERT INTO ehr.cage VALUES ('a246-0007', 'a246', '0007', '31', '31.25', '33', null, null, '155');
INSERT INTO ehr.cage VALUES ('a246-0008', 'a246', '0008', '31', '31.25', '33', null, null, '156');
INSERT INTO ehr.cage VALUES ('a246-0009', 'a246', '0009', '31', '31.25', '33', null, null, '157');
INSERT INTO ehr.cage VALUES ('a246-0010', 'a246', '0010', '31', '31.25', '33', null, null, '158');
INSERT INTO ehr.cage VALUES ('a246-0011', 'a246', '0011', '31', '31.25', '33', null, null, '159');
INSERT INTO ehr.cage VALUES ('a246-0012', 'a246', '0012', '31', '31.25', '33', null, null, '160');
INSERT INTO ehr.cage VALUES ('a246-0013', 'a246', '0013', '31', '31.25', '33', null, null, '161');
INSERT INTO ehr.cage VALUES ('a246-0014', 'a246', '0014', '31', '31.25', '33', null, null, '162');
INSERT INTO ehr.cage VALUES ('a246-0015', 'a246', '0015', '31', '31.25', '33', null, null, '163');
INSERT INTO ehr.cage VALUES ('a246-0016', 'a246', '0016', '31', '31.25', '33', null, null, '164');
INSERT INTO ehr.cage VALUES ('a246-0017', 'a246', '0017', '33', '40.5', '37.5', null, null, '165');
INSERT INTO ehr.cage VALUES ('a246-0018', 'a246', '0018', '33', '40.5', '37.5', null, null, '166');
INSERT INTO ehr.cage VALUES ('a246-0019', 'a246', '0019', '33', '40.5', '37.5', null, null, '167');
INSERT INTO ehr.cage VALUES ('a246-0020', 'a246', '0020', '33', '40.5', '37.5', null, null, '168');
INSERT INTO ehr.cage VALUES ('a260-0001', 'a260', '0001', '33', '40.5', '37.5', null, null, '169');
INSERT INTO ehr.cage VALUES ('a260-0002', 'a260', '0002', '33', '40.5', '37.5', null, null, '170');
INSERT INTO ehr.cage VALUES ('a260-0003', 'a260', '0003', '33', '40.5', '37.5', null, null, '171');
INSERT INTO ehr.cage VALUES ('a260-0004', 'a260', '0004', '33', '40.5', '37.5', null, null, '172');
INSERT INTO ehr.cage VALUES ('a260-0005', 'a260', '0005', '31', '31.25', '33', null, null, '173');
INSERT INTO ehr.cage VALUES ('a260-0006', 'a260', '0006', '31', '31.25', '33', null, null, '174');
INSERT INTO ehr.cage VALUES ('a260-0007', 'a260', '0007', '31', '31.25', '33', null, null, '175');
INSERT INTO ehr.cage VALUES ('a260-0008', 'a260', '0008', '31', '31.25', '33', null, null, '176');
INSERT INTO ehr.cage VALUES ('a260-0009', 'a260', '0009', '31', '31.25', '33', null, null, '177');
INSERT INTO ehr.cage VALUES ('a260-0010', 'a260', '0010', '31', '31.25', '33', null, null, '178');
INSERT INTO ehr.cage VALUES ('a260-0011', 'a260', '0011', '31', '31.25', '33', null, null, '179');
INSERT INTO ehr.cage VALUES ('a260-0012', 'a260', '0012', '31', '31.25', '33', null, null, '180');
INSERT INTO ehr.cage VALUES ('a260-0013', 'a260', '0013', '31', '31.25', '33', null, null, '181');
INSERT INTO ehr.cage VALUES ('a260-0014', 'a260', '0014', '31', '31.25', '33', null, null, '182');
INSERT INTO ehr.cage VALUES ('a260-0015', 'a260', '0015', '31', '31.25', '33', null, null, '183');
INSERT INTO ehr.cage VALUES ('a260-0016', 'a260', '0016', '31', '31.25', '33', null, null, '184');
INSERT INTO ehr.cage VALUES ('a260-0017', 'a260', '0017', '31', '31.25', '33', null, null, '185');
INSERT INTO ehr.cage VALUES ('a260-0018', 'a260', '0018', '31', '31.25', '33', null, null, '186');
INSERT INTO ehr.cage VALUES ('a260-0019', 'a260', '0019', '31', '31.25', '33', null, null, '187');
INSERT INTO ehr.cage VALUES ('a260-0020', 'a260', '0020', '31', '31.25', '33', null, null, '188');
INSERT INTO ehr.cage VALUES ('a261-0001', 'a261', '0001', '31', '31.25', '33', null, null, '189');
INSERT INTO ehr.cage VALUES ('a261-0002', 'a261', '0002', '31', '31.25', '33', null, null, '190');
INSERT INTO ehr.cage VALUES ('a261-0003', 'a261', '0003', '31', '31.25', '33', null, null, '191');
INSERT INTO ehr.cage VALUES ('a261-0004', 'a261', '0004', '31', '31.25', '33', null, null, '192');
INSERT INTO ehr.cage VALUES ('a261-0005', 'a261', '0005', '31', '31.25', '33', null, null, '193');
INSERT INTO ehr.cage VALUES ('a261-0006', 'a261', '0006', '31', '31.25', '33', null, null, '194');
INSERT INTO ehr.cage VALUES ('a261-0007', 'a261', '0007', '31', '31.25', '33', null, null, '195');
INSERT INTO ehr.cage VALUES ('a261-0008', 'a261', '0008', '31', '31.25', '33', null, null, '196');
INSERT INTO ehr.cage VALUES ('a261-0009', 'a261', '0009', '31', '31.25', '33', null, null, '197');
INSERT INTO ehr.cage VALUES ('a261-0010', 'a261', '0010', '31', '31.25', '33', null, null, '198');
INSERT INTO ehr.cage VALUES ('a261-0011', 'a261', '0011', '31', '31.25', '33', null, null, '199');
INSERT INTO ehr.cage VALUES ('a261-0012', 'a261', '0012', '31', '31.25', '33', null, null, '200');
INSERT INTO ehr.cage VALUES ('a261-0013', 'a261', '0013', '31', '31.25', '33', null, null, '201');
INSERT INTO ehr.cage VALUES ('a261-0014', 'a261', '0014', '31', '31.25', '33', null, null, '202');
INSERT INTO ehr.cage VALUES ('a261-0015', 'a261', '0015', '31', '31.25', '33', null, null, '203');
INSERT INTO ehr.cage VALUES ('a261-0016', 'a261', '0016', '31', '31.25', '33', null, null, '204');
INSERT INTO ehr.cage VALUES ('a262a-0001', 'a262a', '0001', '31', '31.25', '33', null, null, '205');
INSERT INTO ehr.cage VALUES ('a262a-0002', 'a262a', '0002', '31', '31.25', '33', null, null, '206');
INSERT INTO ehr.cage VALUES ('a262a-0003', 'a262a', '0003', '31', '31.25', '33', null, null, '207');
INSERT INTO ehr.cage VALUES ('a262a-0004', 'a262a', '0004', '31', '31.25', '33', null, null, '208');
INSERT INTO ehr.cage VALUES ('a262a-0005', 'a262a', '0005', '31', '31.25', '33', null, null, '209');
INSERT INTO ehr.cage VALUES ('a262a-0006', 'a262a', '0006', '31', '31.25', '33', null, null, '210');
INSERT INTO ehr.cage VALUES ('a262a-0007', 'a262a', '0007', '31', '31.25', '33', null, null, '211');
INSERT INTO ehr.cage VALUES ('a262a-0008', 'a262a', '0008', '31', '31.25', '33', null, null, '212');
INSERT INTO ehr.cage VALUES ('a262a-0009', 'a262a', '0009', '31', '31.25', '33', null, null, '213');
INSERT INTO ehr.cage VALUES ('a262a-0010', 'a262a', '0010', '31', '31.25', '33', null, null, '214');
INSERT INTO ehr.cage VALUES ('a262a-0011', 'a262a', '0011', '31', '31.25', '33', null, null, '215');
INSERT INTO ehr.cage VALUES ('a262a-0012', 'a262a', '0012', '31', '31.25', '33', null, null, '216');
INSERT INTO ehr.cage VALUES ('a262a-0013', 'a262a', '0013', '31', '31.25', '33', null, null, '217');
INSERT INTO ehr.cage VALUES ('a262a-0014', 'a262a', '0014', '31', '31.25', '33', null, null, '218');
INSERT INTO ehr.cage VALUES ('a262a-0015', 'a262a', '0015', '31', '31.25', '33', null, null, '219');
INSERT INTO ehr.cage VALUES ('a262a-0016', 'a262a', '0016', '31', '31.25', '33', null, null, '220');
INSERT INTO ehr.cage VALUES ('a262b-0001', 'a262b', '0001', '31', '31.25', '33', null, null, '221');
INSERT INTO ehr.cage VALUES ('a262b-0002', 'a262b', '0002', '31', '31.25', '33', null, null, '222');
INSERT INTO ehr.cage VALUES ('a262b-0003', 'a262b', '0003', '31', '31.25', '33', null, null, '223');
INSERT INTO ehr.cage VALUES ('a262b-0004', 'a262b', '0004', '31', '31.25', '33', null, null, '224');
INSERT INTO ehr.cage VALUES ('a262b-0005', 'a262b', '0005', '31', '31.25', '33', null, null, '225');
INSERT INTO ehr.cage VALUES ('a262b-0006', 'a262b', '0006', '31', '31.25', '33', null, null, '226');
INSERT INTO ehr.cage VALUES ('a262b-0007', 'a262b', '0007', '31', '31.25', '33', null, null, '227');
INSERT INTO ehr.cage VALUES ('a262b-0008', 'a262b', '0008', '31', '31.25', '33', null, null, '228');
INSERT INTO ehr.cage VALUES ('a262b-0009', 'a262b', '0009', '31', '31.25', '33', null, null, '229');
INSERT INTO ehr.cage VALUES ('a262b-0010', 'a262b', '0010', '31', '31.25', '33', null, null, '230');
INSERT INTO ehr.cage VALUES ('a262b-0011', 'a262b', '0011', '31', '31.25', '33', null, null, '231');
INSERT INTO ehr.cage VALUES ('a262b-0012', 'a262b', '0012', '31', '31.25', '33', null, null, '232');
INSERT INTO ehr.cage VALUES ('a262b-0013', 'a262b', '0013', '31', '31.25', '33', null, null, '233');
INSERT INTO ehr.cage VALUES ('a262b-0014', 'a262b', '0014', '31', '31.25', '33', null, null, '234');
INSERT INTO ehr.cage VALUES ('a262b-0015', 'a262b', '0015', '31', '31.25', '33', null, null, '235');
INSERT INTO ehr.cage VALUES ('a262b-0016', 'a262b', '0016', '31', '31.25', '33', null, null, '236');
INSERT INTO ehr.cage VALUES ('a263a-0001', 'a263a', '0001', '31', '31.25', '33', null, null, '237');
INSERT INTO ehr.cage VALUES ('a263a-0002', 'a263a', '0002', '31', '31.25', '33', null, null, '238');
INSERT INTO ehr.cage VALUES ('a263a-0003', 'a263a', '0003', '31', '31.25', '33', null, null, '239');
INSERT INTO ehr.cage VALUES ('a263a-0004', 'a263a', '0004', '31', '31.25', '33', null, null, '240');
INSERT INTO ehr.cage VALUES ('a263a-0005', 'a263a', '0005', '31', '31.25', '33', null, null, '241');
INSERT INTO ehr.cage VALUES ('a263a-0006', 'a263a', '0006', '31', '31.25', '33', null, null, '242');
INSERT INTO ehr.cage VALUES ('a263a-0007', 'a263a', '0007', '31', '31.25', '33', null, null, '243');
INSERT INTO ehr.cage VALUES ('a263a-0008', 'a263a', '0008', '31', '31.25', '33', null, null, '244');
INSERT INTO ehr.cage VALUES ('a263a-0009', 'a263a', '0009', '31', '31.25', '33', null, null, '245');
INSERT INTO ehr.cage VALUES ('a263a-0010', 'a263a', '0010', '31', '31.25', '33', null, null, '246');
INSERT INTO ehr.cage VALUES ('a263a-0011', 'a263a', '0011', '31', '31.25', '33', null, null, '247');
INSERT INTO ehr.cage VALUES ('a263a-0012', 'a263a', '0012', '31', '31.25', '33', null, null, '248');
INSERT INTO ehr.cage VALUES ('a263a-0013', 'a263a', '0013', '31', '31.25', '33', null, null, '249');
INSERT INTO ehr.cage VALUES ('a263a-0014', 'a263a', '0014', '31', '31.25', '33', null, null, '250');
INSERT INTO ehr.cage VALUES ('a263a-0015', 'a263a', '0015', '31', '31.25', '33', null, null, '251');
INSERT INTO ehr.cage VALUES ('a263a-0016', 'a263a', '0016', '31', '31.25', '33', null, null, '252');
INSERT INTO ehr.cage VALUES ('a263b-0001', 'a263b', '0001', '31', '31.25', '33', null, null, '253');
INSERT INTO ehr.cage VALUES ('a263b-0002', 'a263b', '0002', '31', '31.25', '33', null, null, '254');
INSERT INTO ehr.cage VALUES ('a263b-0003', 'a263b', '0003', '31', '31.25', '33', null, null, '255');
INSERT INTO ehr.cage VALUES ('a263b-0004', 'a263b', '0004', '31', '31.25', '33', null, null, '256');
INSERT INTO ehr.cage VALUES ('a263b-0005', 'a263b', '0005', '31', '31.25', '33', null, null, '257');
INSERT INTO ehr.cage VALUES ('a263b-0006', 'a263b', '0006', '31', '31.25', '33', null, null, '258');
INSERT INTO ehr.cage VALUES ('a263b-0007', 'a263b', '0007', '31', '31.25', '33', null, null, '259');
INSERT INTO ehr.cage VALUES ('a263b-0008', 'a263b', '0008', '31', '31.25', '33', null, null, '260');
INSERT INTO ehr.cage VALUES ('a263b-0009', 'a263b', '0009', '31', '31.25', '33', null, null, '261');
INSERT INTO ehr.cage VALUES ('a263b-0010', 'a263b', '0010', '31', '31.25', '33', null, null, '262');
INSERT INTO ehr.cage VALUES ('a263b-0011', 'a263b', '0011', '31', '31.25', '33', null, null, '263');
INSERT INTO ehr.cage VALUES ('a263b-0012', 'a263b', '0012', '31', '31.25', '33', null, null, '264');
INSERT INTO ehr.cage VALUES ('a263b-0013', 'a263b', '0013', '31', '31.25', '33', null, null, '265');
INSERT INTO ehr.cage VALUES ('a263b-0014', 'a263b', '0014', '31', '31.25', '33', null, null, '266');
INSERT INTO ehr.cage VALUES ('a263b-0015', 'a263b', '0015', '31', '31.25', '33', null, null, '267');
INSERT INTO ehr.cage VALUES ('a263b-0016', 'a263b', '0016', '31', '31.25', '33', null, null, '268');
INSERT INTO ehr.cage VALUES ('a265-0001', 'a265', '0001', '31', '31.25', '33', null, null, '269');
INSERT INTO ehr.cage VALUES ('a265-0002', 'a265', '0002', '31', '31.25', '33', null, null, '270');
INSERT INTO ehr.cage VALUES ('a265-0003', 'a265', '0003', '31', '31.25', '33', null, null, '271');
INSERT INTO ehr.cage VALUES ('a265-0004', 'a265', '0004', '31', '31.25', '33', null, null, '272');
INSERT INTO ehr.cage VALUES ('a265-0005', 'a265', '0005', '31', '31.25', '33', null, null, '273');
INSERT INTO ehr.cage VALUES ('a265-0006', 'a265', '0006', '31', '31.25', '33', null, null, '274');
INSERT INTO ehr.cage VALUES ('a265-0007', 'a265', '0007', '31', '31.25', '33', null, null, '275');
INSERT INTO ehr.cage VALUES ('a265-0008', 'a265', '0008', '31', '31.25', '33', null, null, '276');
INSERT INTO ehr.cage VALUES ('a265-0009', 'a265', '0009', '31', '31.25', '33', null, null, '277');
INSERT INTO ehr.cage VALUES ('a265-0010', 'a265', '0010', '31', '31.25', '33', null, null, '278');
INSERT INTO ehr.cage VALUES ('a265-0011', 'a265', '0011', '31', '31.25', '33', null, null, '279');
INSERT INTO ehr.cage VALUES ('a265-0012', 'a265', '0012', '31', '31.25', '33', null, null, '280');
INSERT INTO ehr.cage VALUES ('a265-0013', 'a265', '0013', '31', '31.25', '33', null, null, '281');
INSERT INTO ehr.cage VALUES ('a265-0014', 'a265', '0014', '31', '31.25', '33', null, null, '282');
INSERT INTO ehr.cage VALUES ('a265-0015', 'a265', '0015', '31', '31.25', '33', null, null, '283');
INSERT INTO ehr.cage VALUES ('a265-0016', 'a265', '0016', '31', '31.25', '33', null, null, '284');
INSERT INTO ehr.cage VALUES ('a265-0017', 'a265', '0017', '31', '31.25', '33', null, null, '285');
INSERT INTO ehr.cage VALUES ('a265-0018', 'a265', '0018', '31', '31.25', '33', null, null, '286');
INSERT INTO ehr.cage VALUES ('a265-0019', 'a265', '0019', '31', '31.25', '33', null, null, '287');
INSERT INTO ehr.cage VALUES ('a265-0020', 'a265', '0020', '31', '31.25', '33', null, null, '288');
INSERT INTO ehr.cage VALUES ('a270-0001', 'a270', '0001', '31', '31.25', '33', null, null, '289');
INSERT INTO ehr.cage VALUES ('a270-0002', 'a270', '0002', '31', '31.25', '33', null, null, '290');
INSERT INTO ehr.cage VALUES ('a270-0003', 'a270', '0003', '31', '31.25', '33', null, null, '291');
INSERT INTO ehr.cage VALUES ('a270-0004', 'a270', '0004', '31', '31.25', '33', null, null, '292');
INSERT INTO ehr.cage VALUES ('a270-0005', 'a270', '0005', '31', '31.25', '33', null, null, '293');
INSERT INTO ehr.cage VALUES ('a270-0006', 'a270', '0006', '31', '31.25', '33', null, null, '294');
INSERT INTO ehr.cage VALUES ('a270-0007', 'a270', '0007', '31', '31.25', '33', null, null, '295');
INSERT INTO ehr.cage VALUES ('a270-0008', 'a270', '0008', '31', '31.25', '33', null, null, '296');
INSERT INTO ehr.cage VALUES ('a270-0009', 'a270', '0009', '31', '31.25', '33', null, null, '297');
INSERT INTO ehr.cage VALUES ('a270-0010', 'a270', '0010', '31', '31.25', '33', null, null, '298');
INSERT INTO ehr.cage VALUES ('a270-0011', 'a270', '0011', '31', '31.25', '33', null, null, '299');
INSERT INTO ehr.cage VALUES ('a270-0012', 'a270', '0012', '31', '31.25', '33', null, null, '300');
INSERT INTO ehr.cage VALUES ('a270-0013', 'a270', '0013', '31', '31.25', '33', null, null, '301');
INSERT INTO ehr.cage VALUES ('a270-0014', 'a270', '0014', '31', '31.25', '33', null, null, '302');
INSERT INTO ehr.cage VALUES ('a270-0015', 'a270', '0015', '31', '31.25', '33', null, null, '303');
INSERT INTO ehr.cage VALUES ('a270-0016', 'a270', '0016', '31', '31.25', '33', null, null, '304');
INSERT INTO ehr.cage VALUES ('a270-0017', 'a270', '0017', '31', '31.25', '33', null, null, '305');
INSERT INTO ehr.cage VALUES ('a270-0018', 'a270', '0018', '31', '31.25', '33', null, null, '306');
INSERT INTO ehr.cage VALUES ('a270-0019', 'a270', '0019', '31', '31.25', '33', null, null, '307');
INSERT INTO ehr.cage VALUES ('a270-0020', 'a270', '0020', '31', '31.25', '33', null, null, '308');
INSERT INTO ehr.cage VALUES ('a270-0021', 'a270', '0021', '31', '31.25', '33', null, null, '309');
INSERT INTO ehr.cage VALUES ('a270-0022', 'a270', '0022', '31', '31.25', '33', null, null, '310');
INSERT INTO ehr.cage VALUES ('a270-0023', 'a270', '0023', '31', '31.25', '33', null, null, '311');
INSERT INTO ehr.cage VALUES ('a270-0024', 'a270', '0024', '31', '31.25', '33', null, null, '312');
INSERT INTO ehr.cage VALUES ('a271-0001', 'a271', '0001', '31', '31.25', '33', null, null, '313');
INSERT INTO ehr.cage VALUES ('a271-0002', 'a271', '0002', '31', '31.25', '33', null, null, '314');
INSERT INTO ehr.cage VALUES ('a271-0003', 'a271', '0003', '31', '31.25', '33', null, null, '315');
INSERT INTO ehr.cage VALUES ('a271-0004', 'a271', '0004', '31', '31.25', '33', null, null, '316');
INSERT INTO ehr.cage VALUES ('a271-0005', 'a271', '0005', '31', '31.25', '33', null, null, '317');
INSERT INTO ehr.cage VALUES ('a271-0006', 'a271', '0006', '31', '31.25', '33', null, null, '318');
INSERT INTO ehr.cage VALUES ('a271-0007', 'a271', '0007', '31', '31.25', '33', null, null, '319');
INSERT INTO ehr.cage VALUES ('a271-0008', 'a271', '0008', '31', '31.25', '33', null, null, '320');
INSERT INTO ehr.cage VALUES ('a271-0009', 'a271', '0009', '31', '31.25', '33', null, null, '321');
INSERT INTO ehr.cage VALUES ('a271-0010', 'a271', '0010', '31', '31.25', '33', null, null, '322');
INSERT INTO ehr.cage VALUES ('a271-0011', 'a271', '0011', '31', '31.25', '33', null, null, '323');
INSERT INTO ehr.cage VALUES ('a271-0012', 'a271', '0012', '31', '31.25', '33', null, null, '324');
INSERT INTO ehr.cage VALUES ('a271-0013', 'a271', '0013', '31', '31.25', '33', null, null, '325');
INSERT INTO ehr.cage VALUES ('a271-0014', 'a271', '0014', '31', '31.25', '33', null, null, '326');
INSERT INTO ehr.cage VALUES ('a271-0015', 'a271', '0015', '31', '31.25', '33', null, null, '327');
INSERT INTO ehr.cage VALUES ('a271-0016', 'a271', '0016', '31', '31.25', '33', null, null, '328');
INSERT INTO ehr.cage VALUES ('a271-0017', 'a271', '0017', '31', '31.25', '33', null, null, '329');
INSERT INTO ehr.cage VALUES ('a271-0018', 'a271', '0018', '31', '31.25', '33', null, null, '330');
INSERT INTO ehr.cage VALUES ('a271-0019', 'a271', '0019', '31', '31.25', '33', null, null, '331');
INSERT INTO ehr.cage VALUES ('a271-0020', 'a271', '0020', '31', '31.25', '33', null, null, '332');
INSERT INTO ehr.cage VALUES ('a271-0021', 'a271', '0021', '31', '31.25', '33', null, null, '333');
INSERT INTO ehr.cage VALUES ('a271-0022', 'a271', '0022', '31', '31.25', '33', null, null, '334');
INSERT INTO ehr.cage VALUES ('a271-0023', 'a271', '0023', '31', '31.25', '33', null, null, '335');
INSERT INTO ehr.cage VALUES ('a271-0024', 'a271', '0024', '31', '31.25', '33', null, null, '336');
INSERT INTO ehr.cage VALUES ('a272-0001', 'a272', '0001', '31', '31.25', '33', null, null, '337');
INSERT INTO ehr.cage VALUES ('a272-0002', 'a272', '0002', '31', '31.25', '33', null, null, '338');
INSERT INTO ehr.cage VALUES ('a272-0003', 'a272', '0003', '31', '31.25', '33', null, null, '339');
INSERT INTO ehr.cage VALUES ('a272-0004', 'a272', '0004', '31', '31.25', '33', null, null, '340');
INSERT INTO ehr.cage VALUES ('a272-0005', 'a272', '0005', '31', '31.25', '33', null, null, '341');
INSERT INTO ehr.cage VALUES ('a272-0006', 'a272', '0006', '31', '31.25', '33', null, null, '342');
INSERT INTO ehr.cage VALUES ('a272-0007', 'a272', '0007', '31', '31.25', '33', null, null, '343');
INSERT INTO ehr.cage VALUES ('a272-0008', 'a272', '0008', '31', '31.25', '33', null, null, '344');
INSERT INTO ehr.cage VALUES ('a272-0009', 'a272', '0009', '31', '31.25', '33', null, null, '345');
INSERT INTO ehr.cage VALUES ('a272-0010', 'a272', '0010', '31', '31.25', '33', null, null, '346');
INSERT INTO ehr.cage VALUES ('a272-0011', 'a272', '0011', '31', '31.25', '33', null, null, '347');
INSERT INTO ehr.cage VALUES ('a272-0012', 'a272', '0012', '31', '31.25', '33', null, null, '348');
INSERT INTO ehr.cage VALUES ('a272-0013', 'a272', '0013', '31', '31.25', '33', null, null, '349');
INSERT INTO ehr.cage VALUES ('a272-0014', 'a272', '0014', '31', '31.25', '33', null, null, '350');
INSERT INTO ehr.cage VALUES ('a272-0015', 'a272', '0015', '31', '31.25', '33', null, null, '351');
INSERT INTO ehr.cage VALUES ('a272-0016', 'a272', '0016', '31', '31.25', '33', null, null, '352');
INSERT INTO ehr.cage VALUES ('a272-0017', 'a272', '0017', '31', '31.25', '33', null, null, '353');
INSERT INTO ehr.cage VALUES ('a272-0018', 'a272', '0018', '31', '31.25', '33', null, null, '354');
INSERT INTO ehr.cage VALUES ('a272-0019', 'a272', '0019', '31', '31.25', '33', null, null, '355');
INSERT INTO ehr.cage VALUES ('a272-0020', 'a272', '0020', '31', '31.25', '33', null, null, '356');
INSERT INTO ehr.cage VALUES ('a272-0021', 'a272', '0021', '31', '31.25', '33', null, null, '357');
INSERT INTO ehr.cage VALUES ('a272-0022', 'a272', '0022', '31', '31.25', '33', null, null, '358');
INSERT INTO ehr.cage VALUES ('a272-0023', 'a272', '0023', '31', '31.25', '33', null, null, '359');
INSERT INTO ehr.cage VALUES ('a272-0024', 'a272', '0024', '31', '31.25', '33', null, null, '360');
INSERT INTO ehr.cage VALUES ('a274-0001', 'a274', '0001', '31', '31.25', '33', null, null, '361');
INSERT INTO ehr.cage VALUES ('a274-0002', 'a274', '0002', '31', '31.25', '33', null, null, '362');
INSERT INTO ehr.cage VALUES ('a274-0003', 'a274', '0003', '31', '31.25', '33', null, null, '363');
INSERT INTO ehr.cage VALUES ('a274-0004', 'a274', '0004', '31', '31.25', '33', null, null, '364');
INSERT INTO ehr.cage VALUES ('a274-0005', 'a274', '0005', '31', '31.25', '33', null, null, '365');
INSERT INTO ehr.cage VALUES ('a274-0006', 'a274', '0006', '31', '31.25', '33', null, null, '366');
INSERT INTO ehr.cage VALUES ('a274-0007', 'a274', '0007', '31', '31.25', '33', null, null, '367');
INSERT INTO ehr.cage VALUES ('a274-0008', 'a274', '0008', '31', '31.25', '33', null, null, '368');
INSERT INTO ehr.cage VALUES ('a274-0009', 'a274', '0009', '31', '31.25', '33', null, null, '369');
INSERT INTO ehr.cage VALUES ('a274-0010', 'a274', '0010', '31', '31.25', '33', null, null, '370');
INSERT INTO ehr.cage VALUES ('a274-0011', 'a274', '0011', '31', '31.25', '33', null, null, '371');
INSERT INTO ehr.cage VALUES ('a274-0012', 'a274', '0012', '31', '31.25', '33', null, null, '372');
INSERT INTO ehr.cage VALUES ('a274-0013', 'a274', '0013', '31', '31.25', '33', null, null, '373');
INSERT INTO ehr.cage VALUES ('a274-0014', 'a274', '0014', '31', '31.25', '33', null, null, '374');
INSERT INTO ehr.cage VALUES ('a274-0015', 'a274', '0015', '31', '31.25', '33', null, null, '375');
INSERT INTO ehr.cage VALUES ('a274-0016', 'a274', '0016', '31', '31.25', '33', null, null, '376');
INSERT INTO ehr.cage VALUES ('a274-0017', 'a274', '0017', '31', '31.25', '33', null, null, '377');
INSERT INTO ehr.cage VALUES ('a274-0018', 'a274', '0018', '31', '31.25', '33', null, null, '378');
INSERT INTO ehr.cage VALUES ('a274-0019', 'a274', '0019', '31', '31.25', '33', null, null, '379');
INSERT INTO ehr.cage VALUES ('a274-0020', 'a274', '0020', '31', '31.25', '33', null, null, '380');
INSERT INTO ehr.cage VALUES ('a274-0021', 'a274', '0021', '31', '31.25', '33', null, null, '381');
INSERT INTO ehr.cage VALUES ('a274-0022', 'a274', '0022', '31', '31.25', '33', null, null, '382');
INSERT INTO ehr.cage VALUES ('a274-0023', 'a274', '0023', '31', '31.25', '33', null, null, '383');
INSERT INTO ehr.cage VALUES ('a274-0024', 'a274', '0024', '31', '31.25', '33', null, null, '384');
INSERT INTO ehr.cage VALUES ('a275-0001', 'a275', '0001', '31', '31.25', '33', null, null, '385');
INSERT INTO ehr.cage VALUES ('a275-0002', 'a275', '0002', '31', '31.25', '33', null, null, '386');
INSERT INTO ehr.cage VALUES ('a275-0003', 'a275', '0003', '31', '31.25', '33', null, null, '387');
INSERT INTO ehr.cage VALUES ('a275-0004', 'a275', '0004', '31', '31.25', '33', null, null, '388');
INSERT INTO ehr.cage VALUES ('a275-0005', 'a275', '0005', '31', '31.25', '33', null, null, '389');
INSERT INTO ehr.cage VALUES ('a275-0006', 'a275', '0006', '31', '31.25', '33', null, null, '390');
INSERT INTO ehr.cage VALUES ('a275-0007', 'a275', '0007', '31', '31.25', '33', null, null, '391');
INSERT INTO ehr.cage VALUES ('a275-0008', 'a275', '0008', '31', '31.25', '33', null, null, '392');
INSERT INTO ehr.cage VALUES ('a275-0009', 'a275', '0009', '31', '31.25', '33', null, null, '393');
INSERT INTO ehr.cage VALUES ('a275-0010', 'a275', '0010', '31', '31.25', '33', null, null, '394');
INSERT INTO ehr.cage VALUES ('a275-0011', 'a275', '0011', '31', '31.25', '33', null, null, '395');
INSERT INTO ehr.cage VALUES ('a275-0012', 'a275', '0012', '31', '31.25', '33', null, null, '396');
INSERT INTO ehr.cage VALUES ('a275-0013', 'a275', '0013', '31', '31.25', '33', null, null, '397');
INSERT INTO ehr.cage VALUES ('a275-0014', 'a275', '0014', '31', '31.25', '33', null, null, '398');
INSERT INTO ehr.cage VALUES ('a275-0015', 'a275', '0015', '31', '31.25', '33', null, null, '399');
INSERT INTO ehr.cage VALUES ('a275-0016', 'a275', '0016', '31', '31.25', '33', null, null, '400');
INSERT INTO ehr.cage VALUES ('a275-0017', 'a275', '0017', '31', '31.25', '33', null, null, '401');
INSERT INTO ehr.cage VALUES ('a275-0018', 'a275', '0018', '31', '31.25', '33', null, null, '402');
INSERT INTO ehr.cage VALUES ('a275-0019', 'a275', '0019', '31', '31.25', '33', null, null, '403');
INSERT INTO ehr.cage VALUES ('a275-0020', 'a275', '0020', '31', '31.25', '33', null, null, '404');
INSERT INTO ehr.cage VALUES ('a275-0021', 'a275', '0021', '31', '31.25', '33', null, null, '405');
INSERT INTO ehr.cage VALUES ('a275-0022', 'a275', '0022', '31', '31.25', '33', null, null, '406');
INSERT INTO ehr.cage VALUES ('a275-0023', 'a275', '0023', '31', '31.25', '33', null, null, '407');
INSERT INTO ehr.cage VALUES ('a275-0024', 'a275', '0024', '31', '31.25', '33', null, null, '408');
INSERT INTO ehr.cage VALUES ('ab108-0001', 'ab108', '0001', '27', '32', '32', null, null, '409');
INSERT INTO ehr.cage VALUES ('ab108-0002', 'ab108', '0002', '27', '32', '32', null, null, '410');
INSERT INTO ehr.cage VALUES ('ab108-0003', 'ab108', '0003', '27', '32', '32', null, null, '411');
INSERT INTO ehr.cage VALUES ('ab108-0004', 'ab108', '0004', '27', '32', '32', null, null, '412');
INSERT INTO ehr.cage VALUES ('ab108-0005', 'ab108', '0005', '27', '23', '32', null, null, '413');
INSERT INTO ehr.cage VALUES ('ab108-0006', 'ab108', '0006', '27', '23', '32', null, null, '414');
INSERT INTO ehr.cage VALUES ('ab108-0007', 'ab108', '0007', '27', '23', '32', null, null, '415');
INSERT INTO ehr.cage VALUES ('ab108-0008', 'ab108', '0008', '27', '23', '32', null, null, '416');
INSERT INTO ehr.cage VALUES ('ab108-0009', 'ab108', '0009', '27', '23', '32', null, null, '417');
INSERT INTO ehr.cage VALUES ('ab108-0010', 'ab108', '0010', '27', '23', '32', null, null, '418');
INSERT INTO ehr.cage VALUES ('ab108-0011', 'ab108', '0011', '27', '23', '32', null, null, '419');
INSERT INTO ehr.cage VALUES ('ab108-0012', 'ab108', '0012', '27', '23', '32', null, null, '420');
INSERT INTO ehr.cage VALUES ('ab108-0013', 'ab108', '0013', '27', '32', '32', null, null, '421');
INSERT INTO ehr.cage VALUES ('ab108-0014', 'ab108', '0014', '27', '32', '32', null, null, '422');
INSERT INTO ehr.cage VALUES ('ab108-0015', 'ab108', '0015', '27', '32', '32', null, null, '423');
INSERT INTO ehr.cage VALUES ('ab108-0016', 'ab108', '0016', '27', '32', '32', null, null, '424');
INSERT INTO ehr.cage VALUES ('ab108-0017', 'ab108', '0017', '27', '23', '32', null, null, '425');
INSERT INTO ehr.cage VALUES ('ab108-0018', 'ab108', '0018', '27', '23', '32', null, null, '426');
INSERT INTO ehr.cage VALUES ('ab108-0019', 'ab108', '0019', '27', '23', '32', null, null, '427');
INSERT INTO ehr.cage VALUES ('ab108-0020', 'ab108', '0020', '27', '23', '32', null, null, '428');
INSERT INTO ehr.cage VALUES ('ab108-0021', 'ab108', '0021', '27', '23', '32', null, null, '429');
INSERT INTO ehr.cage VALUES ('ab108-0022', 'ab108', '0022', '27', '23', '32', null, null, '430');
INSERT INTO ehr.cage VALUES ('ab108-0023', 'ab108', '0023', '27', '23', '32', null, null, '431');
INSERT INTO ehr.cage VALUES ('ab108-0024', 'ab108', '0024', '27', '23', '32', null, null, '432');
INSERT INTO ehr.cage VALUES ('ab108-0025', 'ab108', '0025', '27', '23', '32', null, null, '433');
INSERT INTO ehr.cage VALUES ('ab108-0026', 'ab108', '0026', '27', '23', '32', null, null, '434');
INSERT INTO ehr.cage VALUES ('ab108-0027', 'ab108', '0027', '27', '23', '32', null, null, '435');
INSERT INTO ehr.cage VALUES ('ab108-0028', 'ab108', '0028', '27', '23', '32', null, null, '436');
INSERT INTO ehr.cage VALUES ('ab108-0029', 'ab108', '0029', '27', '23', '32', null, null, '437');
INSERT INTO ehr.cage VALUES ('ab108-0030', 'ab108', '0030', '27', '23', '32', null, null, '438');
INSERT INTO ehr.cage VALUES ('ab108-0031', 'ab108', '0031', '27', '23', '32', null, null, '439');
INSERT INTO ehr.cage VALUES ('ab108-0032', 'ab108', '0032', '27', '23', '32', null, null, '440');
INSERT INTO ehr.cage VALUES ('ab108-0033', 'ab108', '0033', '27', '32', '32', null, null, '441');
INSERT INTO ehr.cage VALUES ('ab108-0034', 'ab108', '0034', '27', '32', '32', null, null, '442');
INSERT INTO ehr.cage VALUES ('ab108-0035', 'ab108', '0035', '27', '32', '32', null, null, '443');
INSERT INTO ehr.cage VALUES ('ab108-0036', 'ab108', '0036', '27', '32', '32', null, null, '444');
INSERT INTO ehr.cage VALUES ('ab108-0037', 'ab108', '0037', '27', '32', '32', null, null, '445');
INSERT INTO ehr.cage VALUES ('ab108-0038', 'ab108', '0038', '27', '32', '32', null, null, '446');
INSERT INTO ehr.cage VALUES ('ab108-0039', 'ab108', '0039', '27', '32', '32', null, null, '447');
INSERT INTO ehr.cage VALUES ('ab108-0040', 'ab108', '0040', '27', '32', '32', null, null, '448');
INSERT INTO ehr.cage VALUES ('ab108-0041', 'ab108', '0041', '27', '32', '32', null, null, '449');
INSERT INTO ehr.cage VALUES ('ab108-0042', 'ab108', '0042', '27', '32', '32', null, null, '450');
INSERT INTO ehr.cage VALUES ('ab108-0043', 'ab108', '0043', '27', '32', '32', null, null, '451');
INSERT INTO ehr.cage VALUES ('ab108-0044', 'ab108', '0044', '27', '32', '32', null, null, '452');
INSERT INTO ehr.cage VALUES ('ab108-0045', 'ab108', '0045', '27', '32', '32', null, null, '453');
INSERT INTO ehr.cage VALUES ('ab108-0046', 'ab108', '0046', '27', '32', '32', null, null, '454');
INSERT INTO ehr.cage VALUES ('ab108-0047', 'ab108', '0047', '27', '32', '32', null, null, '455');
INSERT INTO ehr.cage VALUES ('ab108-0048', 'ab108', '0048', '27', '32', '32', null, null, '456');
INSERT INTO ehr.cage VALUES ('ab110-0001', 'ab110', '0001', '27', '32', '32', null, null, '457');
INSERT INTO ehr.cage VALUES ('ab110-0002', 'ab110', '0002', '27', '32', '32', null, null, '458');
INSERT INTO ehr.cage VALUES ('ab110-0003', 'ab110', '0003', '27', '32', '32', null, null, '459');
INSERT INTO ehr.cage VALUES ('ab110-0004', 'ab110', '0004', '27', '32', '32', null, null, '460');
INSERT INTO ehr.cage VALUES ('ab110-0005', 'ab110', '0005', '27', '32', '32', null, null, '461');
INSERT INTO ehr.cage VALUES ('ab110-0006', 'ab110', '0006', '27', '32', '32', null, null, '462');
INSERT INTO ehr.cage VALUES ('ab110-0007', 'ab110', '0007', '27', '32', '32', null, null, '463');
INSERT INTO ehr.cage VALUES ('ab110-0008', 'ab110', '0008', '27', '32', '32', null, null, '464');
INSERT INTO ehr.cage VALUES ('ab110-0009', 'ab110', '0009', '27', '23', '32', null, null, '465');
INSERT INTO ehr.cage VALUES ('ab110-0010', 'ab110', '0010', '27', '23', '32', null, null, '466');
INSERT INTO ehr.cage VALUES ('ab110-0011', 'ab110', '0011', '27', '23', '32', null, null, '467');
INSERT INTO ehr.cage VALUES ('ab110-0012', 'ab110', '0012', '27', '23', '32', null, null, '468');
INSERT INTO ehr.cage VALUES ('ab110-0013', 'ab110', '0013', '27', '32', '32', null, null, '469');
INSERT INTO ehr.cage VALUES ('ab110-0014', 'ab110', '0014', '27', '32', '32', null, null, '470');
INSERT INTO ehr.cage VALUES ('ab110-0015', 'ab110', '0015', '27', '32', '32', null, null, '471');
INSERT INTO ehr.cage VALUES ('ab110-0016', 'ab110', '0016', '27', '32', '32', null, null, '472');
INSERT INTO ehr.cage VALUES ('ab110-0017', 'ab110', '0017', '27', '23', '32', null, null, '473');
INSERT INTO ehr.cage VALUES ('ab110-0018', 'ab110', '0018', '27', '23', '32', null, null, '474');
INSERT INTO ehr.cage VALUES ('ab110-0019', 'ab110', '0019', '27', '23', '32', null, null, '475');
INSERT INTO ehr.cage VALUES ('ab110-0020', 'ab110', '0020', '27', '23', '32', null, null, '476');
INSERT INTO ehr.cage VALUES ('ab110-0021', 'ab110', '0021', '27', '23', '32', null, null, '477');
INSERT INTO ehr.cage VALUES ('ab110-0022', 'ab110', '0022', '27', '23', '32', null, null, '478');
INSERT INTO ehr.cage VALUES ('ab110-0023', 'ab110', '0023', '27', '23', '32', null, null, '479');
INSERT INTO ehr.cage VALUES ('ab110-0024', 'ab110', '0024', '27', '23', '32', null, null, '480');
INSERT INTO ehr.cage VALUES ('ab110-0025', 'ab110', '0025', '27', '23', '32', null, null, '481');
INSERT INTO ehr.cage VALUES ('ab110-0026', 'ab110', '0026', '27', '23', '32', null, null, '482');
INSERT INTO ehr.cage VALUES ('ab110-0027', 'ab110', '0027', '27', '23', '32', null, null, '483');
INSERT INTO ehr.cage VALUES ('ab110-0028', 'ab110', '0028', '27', '23', '32', null, null, '484');
INSERT INTO ehr.cage VALUES ('ab110-0029', 'ab110', '0029', '27', '23', '32', null, null, '485');
INSERT INTO ehr.cage VALUES ('ab110-0030', 'ab110', '0030', '27', '23', '32', null, null, '486');
INSERT INTO ehr.cage VALUES ('ab110-0031', 'ab110', '0031', '27', '23', '32', null, null, '487');
INSERT INTO ehr.cage VALUES ('ab110-0032', 'ab110', '0032', '27', '23', '32', null, null, '488');
INSERT INTO ehr.cage VALUES ('ab110-0033', 'ab110', '0033', '27', '32', '32', null, null, '489');
INSERT INTO ehr.cage VALUES ('ab110-0034', 'ab110', '0034', '27', '32', '32', null, null, '490');
INSERT INTO ehr.cage VALUES ('ab110-0035', 'ab110', '0035', '27', '32', '32', null, null, '491');
INSERT INTO ehr.cage VALUES ('ab110-0036', 'ab110', '0036', '27', '32', '32', null, null, '492');
INSERT INTO ehr.cage VALUES ('ab110-0037', 'ab110', '0037', '27', '23', '32', null, null, '493');
INSERT INTO ehr.cage VALUES ('ab110-0038', 'ab110', '0038', '27', '23', '32', null, null, '494');
INSERT INTO ehr.cage VALUES ('ab110-0039', 'ab110', '0039', '27', '23', '32', null, null, '495');
INSERT INTO ehr.cage VALUES ('ab110-0040', 'ab110', '0040', '27', '23', '32', null, null, '496');
INSERT INTO ehr.cage VALUES ('ab110-0041', 'ab110', '0041', '27', '32', '32', null, null, '497');
INSERT INTO ehr.cage VALUES ('ab110-0042', 'ab110', '0042', '27', '32', '32', null, null, '498');
INSERT INTO ehr.cage VALUES ('ab110-0043', 'ab110', '0043', '27', '32', '32', null, null, '499');
INSERT INTO ehr.cage VALUES ('ab110-0044', 'ab110', '0044', '27', '32', '32', null, null, '500');
INSERT INTO ehr.cage VALUES ('ab110-0045', 'ab110', '0045', '27', '32', '32', null, null, '501');
INSERT INTO ehr.cage VALUES ('ab110-0046', 'ab110', '0046', '27', '32', '32', null, null, '502');
INSERT INTO ehr.cage VALUES ('ab110-0047', 'ab110', '0047', '27', '32', '32', null, null, '503');
INSERT INTO ehr.cage VALUES ('ab110-0048', 'ab110', '0048', '27', '32', '32', null, null, '504');
INSERT INTO ehr.cage VALUES ('ab111-0001', 'ab111', '0001', '27', '32', '32', null, null, '505');
INSERT INTO ehr.cage VALUES ('ab111-0002', 'ab111', '0002', '27', '32', '32', null, null, '506');
INSERT INTO ehr.cage VALUES ('ab111-0003', 'ab111', '0003', '27', '32', '32', null, null, '507');
INSERT INTO ehr.cage VALUES ('ab111-0004', 'ab111', '0004', '27', '32', '32', null, null, '508');
INSERT INTO ehr.cage VALUES ('ab111-0005', 'ab111', '0005', '27', '23', '32', null, null, '509');
INSERT INTO ehr.cage VALUES ('ab111-0006', 'ab111', '0006', '27', '23', '32', null, null, '510');
INSERT INTO ehr.cage VALUES ('ab111-0007', 'ab111', '0007', '27', '23', '32', null, null, '511');
INSERT INTO ehr.cage VALUES ('ab111-0008', 'ab111', '0008', '27', '23', '32', null, null, '512');
INSERT INTO ehr.cage VALUES ('ab111-0009', 'ab111', '0009', '27', '23', '32', null, null, '513');
INSERT INTO ehr.cage VALUES ('ab111-0010', 'ab111', '0010', '27', '23', '32', null, null, '514');
INSERT INTO ehr.cage VALUES ('ab111-0011', 'ab111', '0011', '27', '23', '32', null, null, '515');
INSERT INTO ehr.cage VALUES ('ab111-0012', 'ab111', '0012', '27', '23', '32', null, null, '516');
INSERT INTO ehr.cage VALUES ('ab111-0013', 'ab111', '0013', '27', '23', '32', null, null, '517');
INSERT INTO ehr.cage VALUES ('ab111-0014', 'ab111', '0014', '27', '23', '32', null, null, '518');
INSERT INTO ehr.cage VALUES ('ab111-0015', 'ab111', '0015', '27', '23', '32', null, null, '519');
INSERT INTO ehr.cage VALUES ('ab111-0016', 'ab111', '0016', '27', '23', '32', null, null, '520');
INSERT INTO ehr.cage VALUES ('ab111-0017', 'ab111', '0017', '27', '32', '32', null, null, '521');
INSERT INTO ehr.cage VALUES ('ab111-0018', 'ab111', '0018', '27', '32', '32', null, null, '522');
INSERT INTO ehr.cage VALUES ('ab111-0019', 'ab111', '0019', '27', '32', '32', null, null, '523');
INSERT INTO ehr.cage VALUES ('ab111-0020', 'ab111', '0020', '27', '32', '32', null, null, '524');
INSERT INTO ehr.cage VALUES ('ab111-0021', 'ab111', '0021', '27', '32', '32', null, null, '525');
INSERT INTO ehr.cage VALUES ('ab111-0022', 'ab111', '0022', '27', '32', '32', null, null, '526');
INSERT INTO ehr.cage VALUES ('ab111-0023', 'ab111', '0023', '27', '32', '32', null, null, '527');
INSERT INTO ehr.cage VALUES ('ab111-0024', 'ab111', '0024', '27', '32', '32', null, null, '528');
INSERT INTO ehr.cage VALUES ('ab112-0001', 'ab112', '0001', '27.5', '24', '31.5', null, null, '529');
INSERT INTO ehr.cage VALUES ('ab112-0002', 'ab112', '0002', '27.5', '24', '31.5', null, null, '530');
INSERT INTO ehr.cage VALUES ('ab112-0003', 'ab112', '0003', '27.5', '24', '31.5', null, null, '531');
INSERT INTO ehr.cage VALUES ('ab112-0004', 'ab112', '0004', '27.5', '24', '31.5', null, null, '532');
INSERT INTO ehr.cage VALUES ('ab112-0005', 'ab112', '0005', '27.5', '24', '31.5', null, null, '533');
INSERT INTO ehr.cage VALUES ('ab112-0006', 'ab112', '0006', '27.5', '24', '31.5', null, null, '534');
INSERT INTO ehr.cage VALUES ('ab112-0007', 'ab112', '0007', '27.5', '24', '31.5', null, null, '535');
INSERT INTO ehr.cage VALUES ('ab112-0008', 'ab112', '0008', '27.5', '24', '31.5', null, null, '536');
INSERT INTO ehr.cage VALUES ('ab112-0009', 'ab112', '0009', '27.5', '24', '31.5', null, null, '537');
INSERT INTO ehr.cage VALUES ('ab112-0010', 'ab112', '0010', '27.5', '24', '31.5', null, null, '538');
INSERT INTO ehr.cage VALUES ('ab112-0011', 'ab112', '0011', '27.5', '24', '31.5', null, null, '539');
INSERT INTO ehr.cage VALUES ('ab112-0012', 'ab112', '0012', '27.5', '24', '31.5', null, null, '540');
INSERT INTO ehr.cage VALUES ('ab112-0013', 'ab112', '0013', '27.5', '24', '31.5', null, null, '541');
INSERT INTO ehr.cage VALUES ('ab112-0014', 'ab112', '0014', '27.5', '24', '31.5', null, null, '542');
INSERT INTO ehr.cage VALUES ('ab112-0015', 'ab112', '0015', '27.5', '24', '31.5', null, null, '543');
INSERT INTO ehr.cage VALUES ('ab112-0016', 'ab112', '0016', '27.5', '24', '31.5', null, null, '544');
INSERT INTO ehr.cage VALUES ('ab113-0001', 'ab113', '0001', '27.5', '24', '31.5', null, null, '545');
INSERT INTO ehr.cage VALUES ('ab113-0002', 'ab113', '0002', '27.5', '24', '31.5', null, null, '546');
INSERT INTO ehr.cage VALUES ('ab113-0003', 'ab113', '0003', '27.5', '24', '31.5', null, null, '547');
INSERT INTO ehr.cage VALUES ('ab113-0004', 'ab113', '0004', '27.5', '24', '31.5', null, null, '548');
INSERT INTO ehr.cage VALUES ('ab113-0005', 'ab113', '0005', '27.5', '24', '31.5', null, null, '549');
INSERT INTO ehr.cage VALUES ('ab113-0006', 'ab113', '0006', '27.5', '24', '31.5', null, null, '550');
INSERT INTO ehr.cage VALUES ('ab113-0007', 'ab113', '0007', '27.5', '24', '31.5', null, null, '551');
INSERT INTO ehr.cage VALUES ('ab113-0008', 'ab113', '0008', '27.5', '24', '31.5', null, null, '552');
INSERT INTO ehr.cage VALUES ('ab113-0009', 'ab113', '0009', '27.5', '24', '31.5', null, null, '553');
INSERT INTO ehr.cage VALUES ('ab113-0010', 'ab113', '0010', '27.5', '24', '31.5', null, null, '554');
INSERT INTO ehr.cage VALUES ('ab113-0011', 'ab113', '0011', '27.5', '24', '31.5', null, null, '555');
INSERT INTO ehr.cage VALUES ('ab113-0012', 'ab113', '0012', '27.5', '24', '31.5', null, null, '556');
INSERT INTO ehr.cage VALUES ('ab113-0013', 'ab113', '0013', '27.5', '24', '31.5', null, null, '557');
INSERT INTO ehr.cage VALUES ('ab113-0014', 'ab113', '0014', '27.5', '24', '31.5', null, null, '558');
INSERT INTO ehr.cage VALUES ('ab113-0015', 'ab113', '0015', '27.5', '24', '31.5', null, null, '559');
INSERT INTO ehr.cage VALUES ('ab113-0016', 'ab113', '0016', '27.5', '24', '31.5', null, null, '560');
INSERT INTO ehr.cage VALUES ('ab113-0017', 'ab113', '0017', '27.5', '24', '31.5', null, null, '561');
INSERT INTO ehr.cage VALUES ('ab113-0018', 'ab113', '0018', '27.5', '24', '31.5', null, null, '562');
INSERT INTO ehr.cage VALUES ('ab113-0019', 'ab113', '0019', '27.5', '24', '31.5', null, null, '563');
INSERT INTO ehr.cage VALUES ('ab113-0020', 'ab113', '0020', '27.5', '24', '31.5', null, null, '564');
INSERT INTO ehr.cage VALUES ('ab113-0021', 'ab113', '0021', '27.5', '24', '31.5', null, null, '565');
INSERT INTO ehr.cage VALUES ('ab113-0022', 'ab113', '0022', '27.5', '24', '31.5', null, null, '566');
INSERT INTO ehr.cage VALUES ('ab113-0023', 'ab113', '0023', '27.5', '24', '31.5', null, null, '567');
INSERT INTO ehr.cage VALUES ('ab113-0024', 'ab113', '0024', '27.5', '24', '31.5', null, null, '568');
INSERT INTO ehr.cage VALUES ('ab117-0001', 'ab117', '0001', '27', '32', '32', null, null, '569');
INSERT INTO ehr.cage VALUES ('ab117-0002', 'ab117', '0002', '27', '32', '32', null, null, '570');
INSERT INTO ehr.cage VALUES ('ab117-0003', 'ab117', '0003', '27', '32', '32', null, null, '571');
INSERT INTO ehr.cage VALUES ('ab117-0004', 'ab117', '0004', '27', '32', '32', null, null, '572');
INSERT INTO ehr.cage VALUES ('ab117-0005', 'ab117', '0005', '27', '32', '32', null, null, '573');
INSERT INTO ehr.cage VALUES ('ab117-0006', 'ab117', '0006', '27', '32', '32', null, null, '574');
INSERT INTO ehr.cage VALUES ('ab117-0007', 'ab117', '0007', '27', '32', '32', null, null, '575');
INSERT INTO ehr.cage VALUES ('ab117-0008', 'ab117', '0008', '27', '32', '32', null, null, '576');
INSERT INTO ehr.cage VALUES ('ab117-0009', 'ab117', '0009', '27', '23', '32', null, null, '577');
INSERT INTO ehr.cage VALUES ('ab117-0010', 'ab117', '0010', '27', '23', '32', null, null, '578');
INSERT INTO ehr.cage VALUES ('ab117-0011', 'ab117', '0011', '27', '23', '32', null, null, '579');
INSERT INTO ehr.cage VALUES ('ab117-0012', 'ab117', '0012', '27', '23', '32', null, null, '580');
INSERT INTO ehr.cage VALUES ('ab117-0013', 'ab117', '0013', '27', '32', '32', null, null, '581');
INSERT INTO ehr.cage VALUES ('ab117-0014', 'ab117', '0014', '27', '32', '32', null, null, '582');
INSERT INTO ehr.cage VALUES ('ab117-0015', 'ab117', '0015', '27', '32', '32', null, null, '583');
INSERT INTO ehr.cage VALUES ('ab117-0016', 'ab117', '0016', '27', '32', '32', null, null, '584');
INSERT INTO ehr.cage VALUES ('ab117-0017', 'ab117', '0017', '27', '32', '32', null, null, '585');
INSERT INTO ehr.cage VALUES ('ab117-0018', 'ab117', '0018', '27', '32', '32', null, null, '586');
INSERT INTO ehr.cage VALUES ('ab117-0019', 'ab117', '0019', '27', '32', '32', null, null, '587');
INSERT INTO ehr.cage VALUES ('ab117-0020', 'ab117', '0020', '27', '32', '32', null, null, '588');
INSERT INTO ehr.cage VALUES ('ab117-0021', 'ab117', '0021', '27', '32', '32', null, null, '589');
INSERT INTO ehr.cage VALUES ('ab117-0022', 'ab117', '0022', '27', '32', '32', null, null, '590');
INSERT INTO ehr.cage VALUES ('ab117-0023', 'ab117', '0023', '27', '32', '32', null, null, '591');
INSERT INTO ehr.cage VALUES ('ab117-0024', 'ab117', '0024', '27', '32', '32', null, null, '592');
INSERT INTO ehr.cage VALUES ('ab118-0001', 'ab118', '0001', '32.875', '33.75', '33.75', null, null, '593');
INSERT INTO ehr.cage VALUES ('ab118-0002', 'ab118', '0002', '32.875', '33.75', '33.75', null, null, '594');
INSERT INTO ehr.cage VALUES ('ab118-0003', 'ab118', '0003', '32.875', '33.75', '33.75', null, null, '595');
INSERT INTO ehr.cage VALUES ('ab118-0004', 'ab118', '0004', '32.875', '33.75', '33.75', null, null, '596');
INSERT INTO ehr.cage VALUES ('ab118-0005', 'ab118', '0005', '32.875', '33.75', '33.75', null, null, '597');
INSERT INTO ehr.cage VALUES ('ab118-0006', 'ab118', '0006', '32.875', '33.75', '33.75', null, null, '598');
INSERT INTO ehr.cage VALUES ('ab118-0007', 'ab118', '0007', '32.875', '33.75', '33.75', null, null, '599');
INSERT INTO ehr.cage VALUES ('ab118-0008', 'ab118', '0008', '32.875', '33.75', '33.75', null, null, '600');
INSERT INTO ehr.cage VALUES ('ab118-0009', 'ab118', '0009', '32.875', '33.75', '33.75', null, null, '601');
INSERT INTO ehr.cage VALUES ('ab118-0010', 'ab118', '0010', '32.875', '33.75', '33.75', null, null, '602');
INSERT INTO ehr.cage VALUES ('ab118-0011', 'ab118', '0011', '32.875', '33.75', '33.75', null, null, '603');
INSERT INTO ehr.cage VALUES ('ab118-0012', 'ab118', '0012', '32.875', '33.75', '33.75', null, null, '604');
INSERT INTO ehr.cage VALUES ('ab118-0013', 'ab118', '0013', '32.875', '33.75', '33.75', null, null, '605');
INSERT INTO ehr.cage VALUES ('ab118-0014', 'ab118', '0014', '32.875', '33.75', '33.75', null, null, '606');
INSERT INTO ehr.cage VALUES ('ab118-0015', 'ab118', '0015', '32.875', '33.75', '33.75', null, null, '607');
INSERT INTO ehr.cage VALUES ('ab118-0016', 'ab118', '0016', '32.875', '33.75', '33.75', null, null, '608');
INSERT INTO ehr.cage VALUES ('ab118-0017', 'ab118', '0017', '32.875', '33.75', '33.75', null, null, '609');
INSERT INTO ehr.cage VALUES ('ab118-0018', 'ab118', '0018', '32.875', '33.75', '33.75', null, null, '610');
INSERT INTO ehr.cage VALUES ('ab118-0019', 'ab118', '0019', '32.875', '33.75', '33.75', null, null, '611');
INSERT INTO ehr.cage VALUES ('ab118-0020', 'ab118', '0020', '32.875', '33.75', '33.75', null, null, '612');
INSERT INTO ehr.cage VALUES ('ab118-0021', 'ab118', '0021', '32.875', '33.75', '33.75', null, null, '613');
INSERT INTO ehr.cage VALUES ('ab118-0022', 'ab118', '0022', '32.875', '33.75', '33.75', null, null, '614');
INSERT INTO ehr.cage VALUES ('ab118-0023', 'ab118', '0023', '32.875', '33.75', '33.75', null, null, '615');
INSERT INTO ehr.cage VALUES ('ab118-0024', 'ab118', '0024', '32.875', '33.75', '33.75', null, null, '616');
INSERT INTO ehr.cage VALUES ('ab118-0025', 'ab118', '0025', '32.875', '33.75', '33.75', null, null, '617');
INSERT INTO ehr.cage VALUES ('ab118-0026', 'ab118', '0026', '32.875', '33.75', '33.75', null, null, '618');
INSERT INTO ehr.cage VALUES ('ab118-0027', 'ab118', '0027', '32.875', '33.75', '33.75', null, null, '619');
INSERT INTO ehr.cage VALUES ('ab118-0028', 'ab118', '0028', '32.875', '33.75', '33.75', null, null, '620');
INSERT INTO ehr.cage VALUES ('ab118-0029', 'ab118', '0029', '32.875', '33.75', '33.75', null, null, '621');
INSERT INTO ehr.cage VALUES ('ab118-0030', 'ab118', '0030', '32.875', '33.75', '33.75', null, null, '622');
INSERT INTO ehr.cage VALUES ('ab118-0031', 'ab118', '0031', '32.875', '33.75', '33.75', null, null, '623');
INSERT INTO ehr.cage VALUES ('ab118-0032', 'ab118', '0032', '32.875', '33.75', '33.75', null, null, '624');
INSERT INTO ehr.cage VALUES ('ab118-0033', 'ab118', '0033', '32.875', '33.75', '33.75', null, null, '625');
INSERT INTO ehr.cage VALUES ('ab118-0034', 'ab118', '0034', '32.875', '33.75', '33.75', null, null, '626');
INSERT INTO ehr.cage VALUES ('ab118-0035', 'ab118', '0035', '32.875', '33.75', '33.75', null, null, '627');
INSERT INTO ehr.cage VALUES ('ab118-0036', 'ab118', '0036', '32.875', '33.75', '33.75', null, null, '628');
INSERT INTO ehr.cage VALUES ('ab118-0037', 'ab118', '0037', '32.875', '33.75', '33.75', null, null, '629');
INSERT INTO ehr.cage VALUES ('ab118-0038', 'ab118', '0038', '32.875', '33.75', '33.75', null, null, '630');
INSERT INTO ehr.cage VALUES ('ab118-0039', 'ab118', '0039', '32.875', '33.75', '33.75', null, null, '631');
INSERT INTO ehr.cage VALUES ('ab118-0040', 'ab118', '0040', '32.875', '33.75', '33.75', null, null, '632');
INSERT INTO ehr.cage VALUES ('ab118-0041', 'ab118', '0041', '32.875', '33.75', '33.75', null, null, '633');
INSERT INTO ehr.cage VALUES ('ab118-0042', 'ab118', '0042', '32.875', '33.75', '33.75', null, null, '634');
INSERT INTO ehr.cage VALUES ('ab118-0043', 'ab118', '0043', '32.875', '33.75', '33.75', null, null, '635');
INSERT INTO ehr.cage VALUES ('ab118-0044', 'ab118', '0044', '32.875', '33.75', '33.75', null, null, '636');
INSERT INTO ehr.cage VALUES ('ab118-0045', 'ab118', '0045', '32.875', '33.75', '33.75', null, null, '637');
INSERT INTO ehr.cage VALUES ('ab118-0046', 'ab118', '0046', '32.875', '33.75', '33.75', null, null, '638');
INSERT INTO ehr.cage VALUES ('ab118-0047', 'ab118', '0047', '32.875', '33.75', '33.75', null, null, '639');
INSERT INTO ehr.cage VALUES ('ab118-0048', 'ab118', '0048', '32.875', '33.75', '33.75', null, null, '640');
INSERT INTO ehr.cage VALUES ('ab119-0001', 'ab119', '0001', '32.875', '33.75', '33.75', null, null, '641');
INSERT INTO ehr.cage VALUES ('ab119-0002', 'ab119', '0002', '32.875', '33.75', '33.75', null, null, '642');
INSERT INTO ehr.cage VALUES ('ab119-0003', 'ab119', '0003', '32.875', '33.75', '33.75', null, null, '643');
INSERT INTO ehr.cage VALUES ('ab119-0004', 'ab119', '0004', '32.875', '33.75', '33.75', null, null, '644');
INSERT INTO ehr.cage VALUES ('ab119-0005', 'ab119', '0005', '32.875', '33.75', '33.75', null, null, '645');
INSERT INTO ehr.cage VALUES ('ab119-0006', 'ab119', '0006', '32.875', '33.75', '33.75', null, null, '646');
INSERT INTO ehr.cage VALUES ('ab119-0007', 'ab119', '0007', '32.875', '33.75', '33.75', null, null, '647');
INSERT INTO ehr.cage VALUES ('ab119-0008', 'ab119', '0008', '32.875', '33.75', '33.75', null, null, '648');
INSERT INTO ehr.cage VALUES ('ab119-0009', 'ab119', '0009', '32.875', '33.75', '33.75', null, null, '649');
INSERT INTO ehr.cage VALUES ('ab119-0010', 'ab119', '0010', '32.875', '33.75', '33.75', null, null, '650');
INSERT INTO ehr.cage VALUES ('ab119-0011', 'ab119', '0011', '32.875', '33.75', '33.75', null, null, '651');
INSERT INTO ehr.cage VALUES ('ab119-0012', 'ab119', '0012', '32.875', '33.75', '33.75', null, null, '652');
INSERT INTO ehr.cage VALUES ('ab119-0013', 'ab119', '0013', '32.875', '33.75', '33.75', null, null, '653');
INSERT INTO ehr.cage VALUES ('ab119-0014', 'ab119', '0014', '32.875', '33.75', '33.75', null, null, '654');
INSERT INTO ehr.cage VALUES ('ab119-0015', 'ab119', '0015', '32.875', '33.75', '33.75', null, null, '655');
INSERT INTO ehr.cage VALUES ('ab119-0016', 'ab119', '0016', '32.875', '33.75', '33.75', null, null, '656');
INSERT INTO ehr.cage VALUES ('ab119-0017', 'ab119', '0017', '32.875', '33.75', '33.75', null, null, '657');
INSERT INTO ehr.cage VALUES ('ab119-0018', 'ab119', '0018', '32.875', '33.75', '33.75', null, null, '658');
INSERT INTO ehr.cage VALUES ('ab119-0019', 'ab119', '0019', '32.875', '33.75', '33.75', null, null, '659');
INSERT INTO ehr.cage VALUES ('ab119-0020', 'ab119', '0020', '32.875', '33.75', '33.75', null, null, '660');
INSERT INTO ehr.cage VALUES ('ab119-0021', 'ab119', '0021', '32.875', '33.75', '33.75', null, null, '661');
INSERT INTO ehr.cage VALUES ('ab119-0022', 'ab119', '0022', '32.875', '33.75', '33.75', null, null, '662');
INSERT INTO ehr.cage VALUES ('ab119-0023', 'ab119', '0023', '32.875', '33.75', '33.75', null, null, '663');
INSERT INTO ehr.cage VALUES ('ab119-0024', 'ab119', '0024', '32.875', '33.75', '33.75', null, null, '664');
INSERT INTO ehr.cage VALUES ('ab119-0025', 'ab119', '0025', '32.875', '33.75', '33.75', null, null, '665');
INSERT INTO ehr.cage VALUES ('ab119-0026', 'ab119', '0026', '32.875', '33.75', '33.75', null, null, '666');
INSERT INTO ehr.cage VALUES ('ab119-0027', 'ab119', '0027', '32.875', '33.75', '33.75', null, null, '667');
INSERT INTO ehr.cage VALUES ('ab119-0028', 'ab119', '0028', '32.875', '33.75', '33.75', null, null, '668');
INSERT INTO ehr.cage VALUES ('ab119-0029', 'ab119', '0029', '32.875', '33.75', '33.75', null, null, '669');
INSERT INTO ehr.cage VALUES ('ab119-0030', 'ab119', '0030', '32.875', '33.75', '33.75', null, null, '670');
INSERT INTO ehr.cage VALUES ('ab119-0031', 'ab119', '0031', '32.875', '33.75', '33.75', null, null, '671');
INSERT INTO ehr.cage VALUES ('ab119-0032', 'ab119', '0032', '32.875', '33.75', '33.75', null, null, '672');
INSERT INTO ehr.cage VALUES ('ab119-0033', 'ab119', '0033', '32.875', '33.75', '33.75', null, null, '673');
INSERT INTO ehr.cage VALUES ('ab119-0034', 'ab119', '0034', '32.875', '33.75', '33.75', null, null, '674');
INSERT INTO ehr.cage VALUES ('ab119-0035', 'ab119', '0035', '32.875', '33.75', '33.75', null, null, '675');
INSERT INTO ehr.cage VALUES ('ab119-0036', 'ab119', '0036', '32.875', '33.75', '33.75', null, null, '676');
INSERT INTO ehr.cage VALUES ('ab119-0037', 'ab119', '0037', '32.875', '33.75', '33.75', null, null, '677');
INSERT INTO ehr.cage VALUES ('ab119-0038', 'ab119', '0038', '32.875', '33.75', '33.75', null, null, '678');
INSERT INTO ehr.cage VALUES ('ab119-0039', 'ab119', '0039', '32.875', '33.75', '33.75', null, null, '679');
INSERT INTO ehr.cage VALUES ('ab119-0040', 'ab119', '0040', '32.875', '33.75', '33.75', null, null, '680');
INSERT INTO ehr.cage VALUES ('ab119-0041', 'ab119', '0041', '32.875', '33.75', '33.75', null, null, '681');
INSERT INTO ehr.cage VALUES ('ab119-0042', 'ab119', '0042', '32.875', '33.75', '33.75', null, null, '682');
INSERT INTO ehr.cage VALUES ('ab119-0043', 'ab119', '0043', '32.875', '33.75', '33.75', null, null, '683');
INSERT INTO ehr.cage VALUES ('ab119-0044', 'ab119', '0044', '32.875', '33.75', '33.75', null, null, '684');
INSERT INTO ehr.cage VALUES ('ab119-0045', 'ab119', '0045', '32.875', '33.75', '33.75', null, null, '685');
INSERT INTO ehr.cage VALUES ('ab119-0046', 'ab119', '0046', '32.875', '33.75', '33.75', null, null, '686');
INSERT INTO ehr.cage VALUES ('ab119-0047', 'ab119', '0047', '32.875', '33.75', '33.75', null, null, '687');
INSERT INTO ehr.cage VALUES ('ab119-0048', 'ab119', '0048', '32.875', '33.75', '33.75', null, null, '688');
INSERT INTO ehr.cage VALUES ('ab119-0049', 'ab119', '0049', '32.875', '33.75', '33.75', null, null, '689');
INSERT INTO ehr.cage VALUES ('ab119-0050', 'ab119', '0050', '32.875', '33.75', '33.75', null, null, '690');
INSERT INTO ehr.cage VALUES ('ab120-0001', 'ab120', '0001', '32.875', '33.75', '33.75', null, null, '691');
INSERT INTO ehr.cage VALUES ('ab120-0002', 'ab120', '0002', '32.875', '33.75', '33.75', null, null, '692');
INSERT INTO ehr.cage VALUES ('ab120-0003', 'ab120', '0003', '32.875', '33.75', '33.75', null, null, '693');
INSERT INTO ehr.cage VALUES ('ab120-0004', 'ab120', '0004', '32.875', '33.75', '33.75', null, null, '694');
INSERT INTO ehr.cage VALUES ('ab120-0005', 'ab120', '0005', '32.875', '33.75', '33.75', null, null, '695');
INSERT INTO ehr.cage VALUES ('ab120-0006', 'ab120', '0006', '32.875', '33.75', '33.75', null, null, '696');
INSERT INTO ehr.cage VALUES ('ab120-0007', 'ab120', '0007', '32.875', '33.75', '33.75', null, null, '697');
INSERT INTO ehr.cage VALUES ('ab120-0008', 'ab120', '0008', '32.875', '33.75', '33.75', null, null, '698');
INSERT INTO ehr.cage VALUES ('ab120-0009', 'ab120', '0009', '32.875', '33.75', '33.75', null, null, '699');
INSERT INTO ehr.cage VALUES ('ab120-0010', 'ab120', '0010', '32.875', '33.75', '33.75', null, null, '700');
INSERT INTO ehr.cage VALUES ('ab120-0011', 'ab120', '0011', '27.25', '29.5', '30.875', null, null, '701');
INSERT INTO ehr.cage VALUES ('ab120-0012', 'ab120', '0012', '27.25', '29.5', '30.875', null, null, '702');
INSERT INTO ehr.cage VALUES ('ab120-0013', 'ab120', '0013', '27.25', '29.5', '30.875', null, null, '703');
INSERT INTO ehr.cage VALUES ('ab120-0014', 'ab120', '0014', '27.25', '29.5', '30.875', null, null, '704');
INSERT INTO ehr.cage VALUES ('ab120-0015', 'ab120', '0015', '27.25', '29.5', '30.875', null, null, '705');
INSERT INTO ehr.cage VALUES ('ab120-0016', 'ab120', '0016', '27.25', '29.5', '30.875', null, null, '706');
INSERT INTO ehr.cage VALUES ('ab120-0017', 'ab120', '0017', '27.25', '29.5', '30.875', null, null, '707');
INSERT INTO ehr.cage VALUES ('ab120-0018', 'ab120', '0018', '27.25', '29.5', '30.875', null, null, '708');
INSERT INTO ehr.cage VALUES ('ab120-0019', 'ab120', '0019', '27.25', '29.5', '30.875', null, null, '709');
INSERT INTO ehr.cage VALUES ('ab120-0020', 'ab120', '0020', '27.25', '29.5', '30.875', null, null, '710');
INSERT INTO ehr.cage VALUES ('ab120-0021', 'ab120', '0021', '27.25', '29.5', '30.875', null, null, '711');
INSERT INTO ehr.cage VALUES ('ab120-0022', 'ab120', '0022', '27.25', '29.5', '30.875', null, null, '712');
INSERT INTO ehr.cage VALUES ('ab120-0023', 'ab120', '0023', '27.25', '29.5', '30.875', null, null, '713');
INSERT INTO ehr.cage VALUES ('ab120-0024', 'ab120', '0024', '27.25', '29.5', '30.875', null, null, '714');
INSERT INTO ehr.cage VALUES ('ab120-0025', 'ab120', '0025', '27.25', '29.5', '30.875', null, null, '715');
INSERT INTO ehr.cage VALUES ('ab120-0026', 'ab120', '0026', '27.25', '29.5', '30.875', null, null, '716');
INSERT INTO ehr.cage VALUES ('ab120-0027', 'ab120', '0027', '27.25', '29.5', '30.875', null, null, '717');
INSERT INTO ehr.cage VALUES ('ab120-0028', 'ab120', '0028', '27.25', '29.5', '30.875', null, null, '718');
INSERT INTO ehr.cage VALUES ('ab120-0029', 'ab120', '0029', '27.25', '29.5', '30.875', null, null, '719');
INSERT INTO ehr.cage VALUES ('ab120-0030', 'ab120', '0030', '27.25', '29.5', '30.875', null, null, '720');
INSERT INTO ehr.cage VALUES ('ab120-0031', 'ab120', '0031', '27.25', '29.5', '30.875', null, null, '721');
INSERT INTO ehr.cage VALUES ('ab120-0032', 'ab120', '0032', '27.25', '29.5', '30.875', null, null, '722');
INSERT INTO ehr.cage VALUES ('ab120-0033', 'ab120', '0033', '27.25', '29.5', '30.875', null, null, '723');
INSERT INTO ehr.cage VALUES ('ab120-0034', 'ab120', '0034', '27.25', '29.5', '30.875', null, null, '724');
INSERT INTO ehr.cage VALUES ('ab120-0035', 'ab120', '0035', '27.25', '29.5', '30.875', null, null, '725');
INSERT INTO ehr.cage VALUES ('ab120-0036', 'ab120', '0036', '27.25', '29.5', '30.875', null, null, '726');
INSERT INTO ehr.cage VALUES ('ab120-0037', 'ab120', '0037', '27.25', '29.5', '30.875', null, null, '727');
INSERT INTO ehr.cage VALUES ('ab120-0038', 'ab120', '0038', '27.25', '29.5', '30.875', null, null, '728');
INSERT INTO ehr.cage VALUES ('ab120-0039', 'ab120', '0039', '27.25', '29.5', '30.875', null, null, '729');
INSERT INTO ehr.cage VALUES ('ab120-0040', 'ab120', '0040', '27.25', '29.5', '30.875', null, null, '730');
INSERT INTO ehr.cage VALUES ('ab120-0041', 'ab120', '0041', '27.25', '29.5', '30.875', null, null, '731');
INSERT INTO ehr.cage VALUES ('ab120-0042', 'ab120', '0042', '27.25', '29.5', '30.875', null, null, '732');
INSERT INTO ehr.cage VALUES ('ab120-0043', 'ab120', '0043', '27.25', '29.5', '30.875', null, null, '733');
INSERT INTO ehr.cage VALUES ('ab120-0044', 'ab120', '0044', '27.25', '29.5', '30.875', null, null, '734');
INSERT INTO ehr.cage VALUES ('ab120-0045', 'ab120', '0045', '27.25', '29.5', '30.875', null, null, '735');
INSERT INTO ehr.cage VALUES ('ab120-0046', 'ab120', '0046', '27.25', '29.5', '30.875', null, null, '736');
INSERT INTO ehr.cage VALUES ('ab126-0001', 'ab126', '0001', '27.5', '24', '30.5', null, null, '737');
INSERT INTO ehr.cage VALUES ('ab126-0002', 'ab126', '0002', '27.5', '24', '30.5', null, null, '738');
INSERT INTO ehr.cage VALUES ('ab126-0003', 'ab126', '0003', '27.5', '24', '30.5', null, null, '739');
INSERT INTO ehr.cage VALUES ('ab126-0004', 'ab126', '0004', '27.5', '24', '30.5', null, null, '740');
INSERT INTO ehr.cage VALUES ('ab126-0005', 'ab126', '0005', '27.5', '24', '30.5', null, null, '741');
INSERT INTO ehr.cage VALUES ('ab126-0006', 'ab126', '0006', '27.5', '24', '30.5', null, null, '742');
INSERT INTO ehr.cage VALUES ('ab126-0007', 'ab126', '0007', '27.5', '24', '30.5', null, null, '743');
INSERT INTO ehr.cage VALUES ('ab126-0008', 'ab126', '0008', '27.5', '24', '30.5', null, null, '744');
INSERT INTO ehr.cage VALUES ('ab140-0001', 'ab140', '0001', '31', '31.25', '33', null, null, '745');
INSERT INTO ehr.cage VALUES ('ab140-0002', 'ab140', '0002', '31', '31.25', '33', null, null, '746');
INSERT INTO ehr.cage VALUES ('ab140-0003', 'ab140', '0003', '31', '31.25', '33', null, null, '747');
INSERT INTO ehr.cage VALUES ('ab140-0004', 'ab140', '0004', '31', '31.25', '33', null, null, '748');
INSERT INTO ehr.cage VALUES ('ab140-0005', 'ab140', '0005', '31', '31.25', '33', null, null, '749');
INSERT INTO ehr.cage VALUES ('ab140-0006', 'ab140', '0006', '31', '31.25', '33', null, null, '750');
INSERT INTO ehr.cage VALUES ('ab140-0007', 'ab140', '0007', '31', '31.25', '33', null, null, '751');
INSERT INTO ehr.cage VALUES ('ab140-0008', 'ab140', '0008', '31', '31.25', '33', null, null, '752');
INSERT INTO ehr.cage VALUES ('ab140-0009', 'ab140', '0009', '31', '31.25', '33', null, null, '753');
INSERT INTO ehr.cage VALUES ('ab140-0010', 'ab140', '0010', '31', '31.25', '33', null, null, '754');
INSERT INTO ehr.cage VALUES ('ab140-0011', 'ab140', '0011', '31', '31.25', '33', null, null, '755');
INSERT INTO ehr.cage VALUES ('ab140-0012', 'ab140', '0012', '31', '31.25', '33', null, null, '756');
INSERT INTO ehr.cage VALUES ('ab140-0013', 'ab140', '0013', '31', '31.25', '33', null, null, '757');
INSERT INTO ehr.cage VALUES ('ab140-0014', 'ab140', '0014', '31', '31.25', '33', null, null, '758');
INSERT INTO ehr.cage VALUES ('ab140-0015', 'ab140', '0015', '31', '31.25', '33', null, null, '759');
INSERT INTO ehr.cage VALUES ('ab140-0016', 'ab140', '0016', '31', '31.25', '33', null, null, '760');
INSERT INTO ehr.cage VALUES ('ab140-0017', 'ab140', '0017', '31', '31.25', '33', null, null, '761');
INSERT INTO ehr.cage VALUES ('ab140-0018', 'ab140', '0018', '31', '31.25', '33', null, null, '762');
INSERT INTO ehr.cage VALUES ('ab140-0019', 'ab140', '0019', '31', '31.25', '33', null, null, '763');
INSERT INTO ehr.cage VALUES ('ab140-0020', 'ab140', '0020', '31', '31.25', '33', null, null, '764');
INSERT INTO ehr.cage VALUES ('ab140-0021', 'ab140', '0021', '31', '31.25', '33', null, null, '765');
INSERT INTO ehr.cage VALUES ('ab140-0022', 'ab140', '0022', '31', '31.25', '33', null, null, '766');
INSERT INTO ehr.cage VALUES ('ab140-0023', 'ab140', '0023', '31', '31.25', '33', null, null, '767');
INSERT INTO ehr.cage VALUES ('ab140-0024', 'ab140', '0024', '31', '31.25', '33', null, null, '768');
INSERT INTO ehr.cage VALUES ('ab142-0001', 'ab142', '0001', '31', '31.25', '33', null, null, '769');
INSERT INTO ehr.cage VALUES ('ab142-0002', 'ab142', '0002', '31', '31.25', '33', null, null, '770');
INSERT INTO ehr.cage VALUES ('ab142-0003', 'ab142', '0003', '31', '31.25', '33', null, null, '771');
INSERT INTO ehr.cage VALUES ('ab142-0004', 'ab142', '0004', '31', '31.25', '33', null, null, '772');
INSERT INTO ehr.cage VALUES ('ab142-0005', 'ab142', '0005', '31', '31.25', '33', null, null, '773');
INSERT INTO ehr.cage VALUES ('ab142-0006', 'ab142', '0006', '31', '31.25', '33', null, null, '774');
INSERT INTO ehr.cage VALUES ('ab142-0007', 'ab142', '0007', '31', '31.25', '33', null, null, '775');
INSERT INTO ehr.cage VALUES ('ab142-0008', 'ab142', '0008', '31', '31.25', '33', null, null, '776');
INSERT INTO ehr.cage VALUES ('ab142-0009', 'ab142', '0009', '31', '31.25', '33', null, null, '777');
INSERT INTO ehr.cage VALUES ('ab142-0010', 'ab142', '0010', '31', '31.25', '33', null, null, '778');
INSERT INTO ehr.cage VALUES ('ab142-0011', 'ab142', '0011', '31', '31.25', '33', null, null, '779');
INSERT INTO ehr.cage VALUES ('ab142-0012', 'ab142', '0012', '31', '31.25', '33', null, null, '780');
INSERT INTO ehr.cage VALUES ('ab142-0013', 'ab142', '0013', '31', '31.25', '33', null, null, '781');
INSERT INTO ehr.cage VALUES ('ab142-0014', 'ab142', '0014', '31', '31.25', '33', null, null, '782');
INSERT INTO ehr.cage VALUES ('ab142-0015', 'ab142', '0015', '31', '31.25', '33', null, null, '783');
INSERT INTO ehr.cage VALUES ('ab142-0016', 'ab142', '0016', '31', '31.25', '33', null, null, '784');
INSERT INTO ehr.cage VALUES ('ab142-0017', 'ab142', '0017', '31', '31.25', '33', null, null, '785');
INSERT INTO ehr.cage VALUES ('ab142-0018', 'ab142', '0018', '31', '31.25', '33', null, null, '786');
INSERT INTO ehr.cage VALUES ('ab142-0019', 'ab142', '0019', '31', '31.25', '33', null, null, '787');
INSERT INTO ehr.cage VALUES ('ab142-0020', 'ab142', '0020', '31', '31.25', '33', null, null, '788');
INSERT INTO ehr.cage VALUES ('ab142-0021', 'ab142', '0021', '31', '31.25', '33', null, null, '789');
INSERT INTO ehr.cage VALUES ('ab142-0022', 'ab142', '0022', '31', '31.25', '33', null, null, '790');
INSERT INTO ehr.cage VALUES ('ab142-0023', 'ab142', '0023', '31', '31.25', '33', null, null, '791');
INSERT INTO ehr.cage VALUES ('ab142-0024', 'ab142', '0024', '31', '31.25', '33', null, null, '792');
INSERT INTO ehr.cage VALUES ('ab144-0001', 'ab144', '0001', '33', '40.5', '37.5', null, null, '793');
INSERT INTO ehr.cage VALUES ('ab144-0002', 'ab144', '0002', '33', '40.5', '37.5', null, null, '794');
INSERT INTO ehr.cage VALUES ('ab144-0003', 'ab144', '0003', '33', '40.5', '37.5', null, null, '795');
INSERT INTO ehr.cage VALUES ('ab144-0004', 'ab144', '0004', '33', '40.5', '37.5', null, null, '796');
INSERT INTO ehr.cage VALUES ('ab144-0005', 'ab144', '0005', '31', '31.25', '33', null, null, '797');
INSERT INTO ehr.cage VALUES ('ab144-0006', 'ab144', '0006', '31', '31.25', '33', null, null, '798');
INSERT INTO ehr.cage VALUES ('ab144-0007', 'ab144', '0007', '31', '31.25', '33', null, null, '799');
INSERT INTO ehr.cage VALUES ('ab144-0008', 'ab144', '0008', '31', '31.25', '33', null, null, '800');
INSERT INTO ehr.cage VALUES ('ab144-0009', 'ab144', '0009', '31', '31.25', '33', null, null, '801');
INSERT INTO ehr.cage VALUES ('ab144-0010', 'ab144', '0010', '31', '31.25', '33', null, null, '802');
INSERT INTO ehr.cage VALUES ('ab144-0011', 'ab144', '0011', '31', '31.25', '33', null, null, '803');
INSERT INTO ehr.cage VALUES ('ab144-0012', 'ab144', '0012', '31', '31.25', '33', null, null, '804');
INSERT INTO ehr.cage VALUES ('ab144-0013', 'ab144', '0013', '31', '31.25', '33', null, null, '805');
INSERT INTO ehr.cage VALUES ('ab144-0014', 'ab144', '0014', '31', '31.25', '33', null, null, '806');
INSERT INTO ehr.cage VALUES ('ab144-0015', 'ab144', '0015', '31', '31.25', '33', null, null, '807');
INSERT INTO ehr.cage VALUES ('ab144-0016', 'ab144', '0016', '31', '31.25', '33', null, null, '808');
INSERT INTO ehr.cage VALUES ('ab144-0017', 'ab144', '0017', '31', '31.25', '33', null, null, '809');
INSERT INTO ehr.cage VALUES ('ab144-0018', 'ab144', '0018', '31', '31.25', '33', null, null, '810');
INSERT INTO ehr.cage VALUES ('ab144-0019', 'ab144', '0019', '31', '31.25', '33', null, null, '811');
INSERT INTO ehr.cage VALUES ('ab144-0020', 'ab144', '0020', '31', '31.25', '33', null, null, '812');
INSERT INTO ehr.cage VALUES ('ab144-0021', 'ab144', '0021', '33', '40.5', '37.5', null, null, '813');
INSERT INTO ehr.cage VALUES ('ab144-0022', 'ab144', '0022', '33', '40.5', '37.5', null, null, '814');
INSERT INTO ehr.cage VALUES ('ab144-0023', 'ab144', '0023', '33', '40.5', '37.5', null, null, '815');
INSERT INTO ehr.cage VALUES ('ab144-0024', 'ab144', '0024', '33', '40.5', '37.5', null, null, '816');
INSERT INTO ehr.cage VALUES ('ab160-0001', 'ab160', '0001', '27.25', '29.5', '30.875', null, null, '817');
INSERT INTO ehr.cage VALUES ('ab160-0002', 'ab160', '0002', '27.25', '29.5', '30.875', null, null, '818');
INSERT INTO ehr.cage VALUES ('ab160-tmp1', 'ab160', 'tmp1', '24', '17.75', '23.75', null, null, '819');
INSERT INTO ehr.cage VALUES ('ab160-tmp2', 'ab160', 'tmp2', '24', '17.75', '23.75', null, null, '820');
INSERT INTO ehr.cage VALUES ('ab160-tmp3', 'ab160', 'tmp3', '24', '17.75', '23.75', null, null, '821');
INSERT INTO ehr.cage VALUES ('ab160-tmp4', 'ab160', 'tmp4', '24', '17.75', '23.75', null, null, '822');
INSERT INTO ehr.cage VALUES ('ab161-0001', 'ab161', '0001', '33', '40.5', '37.5', null, null, '823');
INSERT INTO ehr.cage VALUES ('ab161-0002', 'ab161', '0002', '33', '40.5', '37.5', null, null, '824');
INSERT INTO ehr.cage VALUES ('ab161-0003', 'ab161', '0003', '33', '40.5', '37.5', null, null, '825');
INSERT INTO ehr.cage VALUES ('ab161-0004', 'ab161', '0004', '33', '40.5', '37.5', null, null, '826');
INSERT INTO ehr.cage VALUES ('ab161-0005', 'ab161', '0005', '31', '31.25', '33', null, null, '827');
INSERT INTO ehr.cage VALUES ('ab161-0006', 'ab161', '0006', '31', '31.25', '33', null, null, '828');
INSERT INTO ehr.cage VALUES ('ab161-0007', 'ab161', '0007', '31', '31.25', '33', null, null, '829');
INSERT INTO ehr.cage VALUES ('ab161-0008', 'ab161', '0008', '31', '31.25', '33', null, null, '830');
INSERT INTO ehr.cage VALUES ('ab161-0009', 'ab161', '0009', '31', '31.25', '33', null, null, '831');
INSERT INTO ehr.cage VALUES ('ab161-0010', 'ab161', '0010', '31', '31.25', '33', null, null, '832');
INSERT INTO ehr.cage VALUES ('ab161-0011', 'ab161', '0011', '31', '31.25', '33', null, null, '833');
INSERT INTO ehr.cage VALUES ('ab161-0012', 'ab161', '0012', '31', '31.25', '33', null, null, '834');
INSERT INTO ehr.cage VALUES ('ab161-0013', 'ab161', '0013', '31', '31.25', '33', null, null, '835');
INSERT INTO ehr.cage VALUES ('ab161-0014', 'ab161', '0014', '31', '31.25', '33', null, null, '836');
INSERT INTO ehr.cage VALUES ('ab161-0015', 'ab161', '0015', '31', '31.25', '33', null, null, '837');
INSERT INTO ehr.cage VALUES ('ab161-0016', 'ab161', '0016', '31', '31.25', '33', null, null, '838');
INSERT INTO ehr.cage VALUES ('ab161-0017', 'ab161', '0017', '31', '31.25', '33', null, null, '839');
INSERT INTO ehr.cage VALUES ('ab161-0018', 'ab161', '0018', '31', '31.25', '33', null, null, '840');
INSERT INTO ehr.cage VALUES ('ab161-0019', 'ab161', '0019', '31', '31.25', '33', null, null, '841');
INSERT INTO ehr.cage VALUES ('ab161-0020', 'ab161', '0020', '31', '31.25', '33', null, null, '842');
INSERT INTO ehr.cage VALUES ('ab161-0021', 'ab161', '0021', '31', '31.25', '33', null, null, '843');
INSERT INTO ehr.cage VALUES ('ab161-0022', 'ab161', '0022', '31', '31.25', '33', null, null, '844');
INSERT INTO ehr.cage VALUES ('ab161-0023', 'ab161', '0023', '31', '31.25', '33', null, null, '845');
INSERT INTO ehr.cage VALUES ('ab161-0024', 'ab161', '0024', '31', '31.25', '33', null, null, '846');
INSERT INTO ehr.cage VALUES ('ab163-0001', 'ab163', '0001', '31', '31.24', '33', null, null, '847');
INSERT INTO ehr.cage VALUES ('ab163-0002', 'ab163', '0002', '31', '31.25', '33', null, null, '848');
INSERT INTO ehr.cage VALUES ('ab163-0003', 'ab163', '0003', '31', '31.25', '33', null, null, '849');
INSERT INTO ehr.cage VALUES ('ab163-0004', 'ab163', '0004', '31', '31.25', '33', null, null, '850');
INSERT INTO ehr.cage VALUES ('ab163-0005', 'ab163', '0005', '33', '40.5', '37.5', null, null, '851');
INSERT INTO ehr.cage VALUES ('ab163-0006', 'ab163', '0006', '33', '40.5', '37.5', null, null, '852');
INSERT INTO ehr.cage VALUES ('ab163-0007', 'ab163', '0007', '33', '40.5', '37.5', null, null, '853');
INSERT INTO ehr.cage VALUES ('ab163-0008', 'ab163', '0008', '33', '40.5', '37.5', null, null, '854');
INSERT INTO ehr.cage VALUES ('ab163-0009', 'ab163', '0009', '31', '31.25', '33', null, null, '855');
INSERT INTO ehr.cage VALUES ('ab163-0010', 'ab163', '0010', '31', '31.25', '33', null, null, '856');
INSERT INTO ehr.cage VALUES ('ab163-0011', 'ab163', '0011', '31', '31.25', '33', null, null, '857');
INSERT INTO ehr.cage VALUES ('ab163-0012', 'ab163', '0012', '31', '31.25', '33', null, null, '858');
INSERT INTO ehr.cage VALUES ('ab163-0013', 'ab163', '0013', '31', '31.25', '33', null, null, '859');
INSERT INTO ehr.cage VALUES ('ab163-0014', 'ab163', '0014', '31', '31.25', '33', null, null, '860');
INSERT INTO ehr.cage VALUES ('ab163-0015', 'ab163', '0015', '31', '31.25', '33', null, null, '861');
INSERT INTO ehr.cage VALUES ('ab163-0016', 'ab163', '0016', '31', '31.25', '33', null, null, '862');
INSERT INTO ehr.cage VALUES ('ab163-0017', 'ab163', '0017', '31', '31.25', '33', null, null, '863');
INSERT INTO ehr.cage VALUES ('ab163-0018', 'ab163', '0018', '31', '31.25', '33', null, null, '864');
INSERT INTO ehr.cage VALUES ('ab163-0019', 'ab163', '0019', '31', '31.25', '33', null, null, '865');
INSERT INTO ehr.cage VALUES ('ab163-0020', 'ab163', '0020', '31', '31.25', '33', null, null, '866');
INSERT INTO ehr.cage VALUES ('ab163-0021', 'ab163', '0021', '31', '31.25', '33', null, null, '867');
INSERT INTO ehr.cage VALUES ('ab163-0022', 'ab163', '0022', '31', '31.25', '33', null, null, '868');
INSERT INTO ehr.cage VALUES ('ab163-0023', 'ab163', '0023', '31', '31.25', '33', null, null, '869');
INSERT INTO ehr.cage VALUES ('ab163-0024', 'ab163', '0024', '31', '31.25', '33', null, null, '870');
INSERT INTO ehr.cage VALUES ('ab165-0001', 'ab165', '0001', '33', '40.5', '37.5', null, null, '871');
INSERT INTO ehr.cage VALUES ('ab165-0002', 'ab165', '0002', '33', '40.5', '37.5', null, null, '872');
INSERT INTO ehr.cage VALUES ('ab165-0003', 'ab165', '0003', '33', '40.5', '37.5', null, null, '873');
INSERT INTO ehr.cage VALUES ('ab165-0004', 'ab165', '0004', '33', '40.5', '37.5', null, null, '874');
INSERT INTO ehr.cage VALUES ('ab165-0005', 'ab165', '0005', '31', '31.25', '33', null, null, '875');
INSERT INTO ehr.cage VALUES ('ab165-0006', 'ab165', '0006', '31', '31.25', '33', null, null, '876');
INSERT INTO ehr.cage VALUES ('ab165-0007', 'ab165', '0007', '31', '31.25', '33', null, null, '877');
INSERT INTO ehr.cage VALUES ('ab165-0008', 'ab165', '0008', '31', '31.25', '33', null, null, '878');
INSERT INTO ehr.cage VALUES ('ab165-0009', 'ab165', '0009', '31', '31.25', '33', null, null, '879');
INSERT INTO ehr.cage VALUES ('ab165-0010', 'ab165', '0010', '31', '31.25', '33', null, null, '880');
INSERT INTO ehr.cage VALUES ('ab165-0011', 'ab165', '0011', '31', '31.25', '33', null, null, '881');
INSERT INTO ehr.cage VALUES ('ab165-0012', 'ab165', '0012', '31', '31.25', '33', null, null, '882');
INSERT INTO ehr.cage VALUES ('ab165-0013', 'ab165', '0013', '31', '31.25', '33', null, null, '883');
INSERT INTO ehr.cage VALUES ('ab165-0014', 'ab165', '0014', '31', '31.25', '33', null, null, '884');
INSERT INTO ehr.cage VALUES ('ab165-0015', 'ab165', '0015', '31', '31.25', '33', null, null, '885');
INSERT INTO ehr.cage VALUES ('ab165-0016', 'ab165', '0016', '31', '31.25', '33', null, null, '886');
INSERT INTO ehr.cage VALUES ('ab165-0017', 'ab165', '0017', '31', '31.25', '33', null, null, '887');
INSERT INTO ehr.cage VALUES ('ab165-0018', 'ab165', '0018', '31', '31.25', '33', null, null, '888');
INSERT INTO ehr.cage VALUES ('ab165-0019', 'ab165', '0019', '31', '31.25', '33', null, null, '889');
INSERT INTO ehr.cage VALUES ('ab165-0020', 'ab165', '0020', '31', '31.25', '33', null, null, '890');
INSERT INTO ehr.cage VALUES ('ab165-0021', 'ab165', '0021', '33', '40.5', '37.5', null, null, '891');
INSERT INTO ehr.cage VALUES ('ab165-0022', 'ab165', '0022', '33', '40.5', '37.5', null, null, '892');
INSERT INTO ehr.cage VALUES ('ab165-0023', 'ab165', '0023', '33', '40.5', '37.5', null, null, '893');
INSERT INTO ehr.cage VALUES ('ab165-0024', 'ab165', '0024', '33', '40.5', '37.5', null, null, '894');
INSERT INTO ehr.cage VALUES ('ab167-0001', 'ab167', '0001', '31', '31.25', '33', null, null, '895');
INSERT INTO ehr.cage VALUES ('ab167-0002', 'ab167', '0002', '31', '31.25', '33', null, null, '896');
INSERT INTO ehr.cage VALUES ('ab167-0003', 'ab167', '0003', '31', '31.25', '33', null, null, '897');
INSERT INTO ehr.cage VALUES ('ab167-0004', 'ab167', '0004', '31', '31.25', '33', null, null, '898');
INSERT INTO ehr.cage VALUES ('ab167-0005', 'ab167', '0005', '31', '31.25', '33', null, null, '899');
INSERT INTO ehr.cage VALUES ('ab167-0006', 'ab167', '0006', '31', '31.25', '33', null, null, '900');
INSERT INTO ehr.cage VALUES ('ab167-0007', 'ab167', '0007', '31', '31.25', '33', null, null, '901');
INSERT INTO ehr.cage VALUES ('ab167-0008', 'ab167', '0008', '31', '31.25', '33', null, null, '902');
INSERT INTO ehr.cage VALUES ('ab167-0009', 'ab167', '0009', '31', '31.25', '33', null, null, '903');
INSERT INTO ehr.cage VALUES ('ab167-0010', 'ab167', '0010', '31', '31.25', '33', null, null, '904');
INSERT INTO ehr.cage VALUES ('ab167-0011', 'ab167', '0011', '31', '31.25', '33', null, null, '905');
INSERT INTO ehr.cage VALUES ('ab167-0012', 'ab167', '0012', '31', '31.25', '33', null, null, '906');
INSERT INTO ehr.cage VALUES ('ab167-0013', 'ab167', '0013', '31', '31.25', '33', null, null, '907');
INSERT INTO ehr.cage VALUES ('ab167-0014', 'ab167', '0014', '31', '31.25', '33', null, null, '908');
INSERT INTO ehr.cage VALUES ('ab167-0015', 'ab167', '0015', '31', '31.25', '33', null, null, '909');
INSERT INTO ehr.cage VALUES ('ab167-0016', 'ab167', '0016', '31', '31.25', '33', null, null, '910');
INSERT INTO ehr.cage VALUES ('ab167-0017', 'ab167', '0017', '31', '31.25', '33', null, null, '911');
INSERT INTO ehr.cage VALUES ('ab167-0018', 'ab167', '0018', '31', '31.25', '33', null, null, '912');
INSERT INTO ehr.cage VALUES ('ab167-0019', 'ab167', '0019', '31', '31.25', '33', null, null, '913');
INSERT INTO ehr.cage VALUES ('ab167-0020', 'ab167', '0020', '31', '31.25', '33', null, null, '914');
INSERT INTO ehr.cage VALUES ('ab167-0021', 'ab167', '0021', '31', '31.25', '33', null, null, '915');
INSERT INTO ehr.cage VALUES ('ab167-0022', 'ab167', '0022', '31', '31.25', '33', null, null, '916');
INSERT INTO ehr.cage VALUES ('ab167-0023', 'ab167', '0023', '31', '31.25', '33', null, null, '917');
INSERT INTO ehr.cage VALUES ('ab167-0024', 'ab167', '0024', '31', '31.25', '33', null, null, '918');
INSERT INTO ehr.cage VALUES ('ab190-pen1', 'ab190', 'pen1', '108', '120', '132', null, null, '919');
INSERT INTO ehr.cage VALUES ('b215a-0001', 'b215a', '0001', '27.5', '29', '31', null, null, '920');
INSERT INTO ehr.cage VALUES ('b215a-0002', 'b215a', '0002', '27.5', '29', '31', null, null, '921');
INSERT INTO ehr.cage VALUES ('b215a-0003', 'b215a', '0003', '27.5', '29', '31', null, null, '922');
INSERT INTO ehr.cage VALUES ('b215a-0004', 'b215a', '0004', '27.5', '29', '31', null, null, '923');
INSERT INTO ehr.cage VALUES ('b215a-0005', 'b215a', '0005', '27.5', '29', '31', null, null, '924');
INSERT INTO ehr.cage VALUES ('b215a-0006', 'b215a', '0006', '27.5', '29', '31', null, null, '925');
INSERT INTO ehr.cage VALUES ('b215a-0007', 'b215a', '0007', '27.5', '29', '31', null, null, '926');
INSERT INTO ehr.cage VALUES ('b215a-0008', 'b215a', '0008', '27.5', '29', '31', null, null, '927');
INSERT INTO ehr.cage VALUES ('b215a-0009', 'b215a', '0009', '27.5', '29', '31', null, null, '928');
INSERT INTO ehr.cage VALUES ('b215a-0010', 'b215a', '0010', '27.5', '29', '31', null, null, '929');
INSERT INTO ehr.cage VALUES ('b215a-0011', 'b215a', '0011', '27.5', '29', '31', null, null, '930');
INSERT INTO ehr.cage VALUES ('b215a-0012', 'b215a', '0012', '27.5', '29', '31', null, null, '931');
INSERT INTO ehr.cage VALUES ('b215b-0001', 'b215b', '0001', '27.5', '29', '31', null, null, '932');
INSERT INTO ehr.cage VALUES ('b215b-0002', 'b215b', '0002', '27.5', '29', '31', null, null, '933');
INSERT INTO ehr.cage VALUES ('b215b-0003', 'b215b', '0003', '27.5', '29', '31', null, null, '934');
INSERT INTO ehr.cage VALUES ('b215b-0004', 'b215b', '0004', '27.5', '29', '31', null, null, '935');
INSERT INTO ehr.cage VALUES ('b215b-0005', 'b215b', '0005', '27.5', '29', '31', null, null, '936');
INSERT INTO ehr.cage VALUES ('b215b-0006', 'b215b', '0006', '27.5', '29', '31', null, null, '937');
INSERT INTO ehr.cage VALUES ('b215b-0007', 'b215b', '0007', '27.5', '29', '31', null, null, '938');
INSERT INTO ehr.cage VALUES ('b215b-0008', 'b215b', '0008', '27.5', '29', '31', null, null, '939');
INSERT INTO ehr.cage VALUES ('b215b-0009', 'b215b', '0009', '27.5', '29', '31', null, null, '940');
INSERT INTO ehr.cage VALUES ('b215b-0010', 'b215b', '0010', '27.5', '29', '31', null, null, '941');
INSERT INTO ehr.cage VALUES ('b215b-0011', 'b215b', '0011', '27.5', '29', '31', null, null, '942');
INSERT INTO ehr.cage VALUES ('b215b-0012', 'b215b', '0012', '27.5', '29', '31', null, null, '943');
INSERT INTO ehr.cage VALUES ('b215c-0001', 'b215c', '0001', '27.5', '29', '31', null, null, '944');
INSERT INTO ehr.cage VALUES ('b215c-0002', 'b215c', '0002', '27.5', '29', '31', null, null, '945');
INSERT INTO ehr.cage VALUES ('b215c-0003', 'b215c', '0003', '27.5', '29', '31', null, null, '946');
INSERT INTO ehr.cage VALUES ('b215c-0004', 'b215c', '0004', '27.5', '29', '31', null, null, '947');
INSERT INTO ehr.cage VALUES ('b215c-0005', 'b215c', '0005', '27.5', '29', '31', null, null, '948');
INSERT INTO ehr.cage VALUES ('b215c-0006', 'b215c', '0006', '27.5', '29', '31', null, null, '949');
INSERT INTO ehr.cage VALUES ('b215c-0007', 'b215c', '0007', '27.5', '29', '31', null, null, '950');
INSERT INTO ehr.cage VALUES ('b215c-0008', 'b215c', '0008', '27.5', '29', '31', null, null, '951');
INSERT INTO ehr.cage VALUES ('b215c-0009', 'b215c', '0009', '27.5', '29', '31', null, null, '952');
INSERT INTO ehr.cage VALUES ('b215c-0010', 'b215c', '0010', '27.5', '29', '31', null, null, '953');
INSERT INTO ehr.cage VALUES ('b215c-0011', 'b215c', '0011', '27.5', '29', '31', null, null, '954');
INSERT INTO ehr.cage VALUES ('b215c-0012', 'b215c', '0012', '27.5', '29', '31', null, null, '955');
INSERT INTO ehr.cage VALUES ('c324-0001', 'c324', '0001', '27', '23.75', '30', null, null, '956');
INSERT INTO ehr.cage VALUES ('c324-0002', 'c324', '0002', '27', '23.75', '30', null, null, '957');
INSERT INTO ehr.cage VALUES ('c324-0003', 'c324', '0003', '27', '23.75', '30', null, null, '958');
INSERT INTO ehr.cage VALUES ('c324-0004', 'c324', '0004', '27', '23.75', '30', null, null, '959');
INSERT INTO ehr.cage VALUES ('c324-0005', 'c324', '0005', '27', '23.75', '30', null, null, '960');
INSERT INTO ehr.cage VALUES ('c324-0006', 'c324', '0006', '27', '23.75', '30', null, null, '961');
INSERT INTO ehr.cage VALUES ('c324-0007', 'c324', '0007', '27', '23.75', '30', null, null, '962');
INSERT INTO ehr.cage VALUES ('c324-0008', 'c324', '0008', '27', '23.75', '30', null, null, '963');
INSERT INTO ehr.cage VALUES ('c324-0009', 'c324', '0009', '27', '23.75', '30', null, null, '964');
INSERT INTO ehr.cage VALUES ('c324-0010', 'c324', '0010', '27', '23.75', '30', null, null, '965');
INSERT INTO ehr.cage VALUES ('c327-0001', 'c327', '0001', '34', '34.5', '36.75', null, null, '966');
INSERT INTO ehr.cage VALUES ('c327-0002', 'c327', '0002', '34', '34.5', '36.75', null, null, '967');
INSERT INTO ehr.cage VALUES ('c327-0003', 'c327', '0003', '34', '34.5', '36.75', null, null, '968');
INSERT INTO ehr.cage VALUES ('c327-0004', 'c327', '0004', '34', '34.5', '36.75', null, null, '969');
INSERT INTO ehr.cage VALUES ('c327-0005', 'c327', '0005', '34', '34.5', '36.75', null, null, '970');
INSERT INTO ehr.cage VALUES ('c327-0006', 'c327', '0006', '34', '34.5', '36.75', null, null, '971');
INSERT INTO ehr.cage VALUES ('c327-0007', 'c327', '0007', '34', '34.5', '36.75', null, null, '972');
INSERT INTO ehr.cage VALUES ('c327-0008', 'c327', '0008', '34', '34.5', '36.75', null, null, '973');
INSERT INTO ehr.cage VALUES ('c331-0001', 'c331', '0001', '25', '26.5', '30', null, null, '974');
INSERT INTO ehr.cage VALUES ('c331-0002', 'c331', '0002', '25', '26.5', '30', null, null, '975');
INSERT INTO ehr.cage VALUES ('c331-0003', 'c331', '0003', '25', '26.5', '30', null, null, '976');
INSERT INTO ehr.cage VALUES ('c331-0004', 'c331', '0004', '25', '26.5', '30', null, null, '977');
INSERT INTO ehr.cage VALUES ('c331-0005', 'c331', '0005', '25', '26.5', '30', null, null, '978');
INSERT INTO ehr.cage VALUES ('c331-0006', 'c331', '0006', '25', '26.5', '30', null, null, '979');
INSERT INTO ehr.cage VALUES ('c331-0007', 'c331', '0007', '25', '26.5', '30', null, null, '980');
INSERT INTO ehr.cage VALUES ('c331-0008', 'c331', '0008', '25', '26.5', '30', null, null, '981');
INSERT INTO ehr.cage VALUES ('c331-0009', 'c331', '0009', '25', '26.5', '30', null, null, '982');
INSERT INTO ehr.cage VALUES ('c331-0010', 'c331', '0010', '25', '26.5', '30', null, null, '983');
INSERT INTO ehr.cage VALUES ('c331-0011', 'c331', '0011', '25', '26.5', '30', null, null, '984');
INSERT INTO ehr.cage VALUES ('c331-0012', 'c331', '0012', '25', '26.5', '30', null, null, '985');
INSERT INTO ehr.cage VALUES ('c338-0001', 'c338', '0001', '32.75', '34.5', '33.25', null, null, '986');
INSERT INTO ehr.cage VALUES ('c338-0002', 'c338', '0002', '32.75', '34.5', '33.25', null, null, '987');
INSERT INTO ehr.cage VALUES ('c338-0003', 'c338', '0003', '32.75', '34.5', '33.25', null, null, '988');
INSERT INTO ehr.cage VALUES ('c338-0004', 'c338', '0004', '32.75', '34.5', '33.25', null, null, '989');
INSERT INTO ehr.cage VALUES ('c338-0005', 'c338', '0005', '32.75', '34.5', '33.25', null, null, '990');
INSERT INTO ehr.cage VALUES ('c338-0006', 'c338', '0006', '32.75', '34.5', '33.25', null, null, '991');
INSERT INTO ehr.cage VALUES ('c338-0007', 'c338', '0007', '32.75', '34.5', '33.25', null, null, '992');
INSERT INTO ehr.cage VALUES ('c338-0008', 'c338', '0008', '32.75', '34.5', '33.25', null, null, '993');
INSERT INTO ehr.cage VALUES ('c338-0009', 'c338', '0009', '32.75', '34.5', '33.25', null, null, '994');
INSERT INTO ehr.cage VALUES ('c338-0010', 'c338', '0010', '32.75', '34.5', '33.25', null, null, '995');
INSERT INTO ehr.cage VALUES ('c338-0011', 'c338', '0011', '32.75', '34.5', '33.25', null, null, '996');
INSERT INTO ehr.cage VALUES ('c338-0012', 'c338', '0012', '32.75', '34.5', '33.25', null, null, '997');
INSERT INTO ehr.cage VALUES ('c338-0013', 'c338', '0013', '32.75', '34.5', '33.25', null, null, '998');
INSERT INTO ehr.cage VALUES ('c338-0014', 'c338', '0014', '32.75', '34.5', '33.25', null, null, '999');
INSERT INTO ehr.cage VALUES ('c338-0015', 'c338', '0015', '32.75', '34.5', '33.25', null, null, '1000');
INSERT INTO ehr.cage VALUES ('c338-0016', 'c338', '0016', '32.75', '34.5', '33.25', null, null, '1001');
INSERT INTO ehr.cage VALUES ('c338-0017', 'c338', '0017', '32.75', '34.5', '33.25', null, null, '1002');
INSERT INTO ehr.cage VALUES ('c338-0018', 'c338', '0018', '32.75', '34.5', '33.25', null, null, '1003');
INSERT INTO ehr.cage VALUES ('c338-0019', 'c338', '0019', '32.75', '34.5', '33.25', null, null, '1004');
INSERT INTO ehr.cage VALUES ('c338-0020', 'c338', '0020', '32.75', '34.5', '33.25', null, null, '1005');
INSERT INTO ehr.cage VALUES ('c338-0021', 'c338', '0021', '32.75', '34.5', '33.25', null, null, '1006');
INSERT INTO ehr.cage VALUES ('c338-0022', 'c338', '0022', '32.75', '34.5', '33.25', null, null, '1007');
INSERT INTO ehr.cage VALUES ('c338-0023', 'c338', '0023', '32.75', '34.5', '33.25', null, null, '1008');
INSERT INTO ehr.cage VALUES ('c338-0024', 'c338', '0024', '32.75', '34.5', '33.25', null, null, '1009');
INSERT INTO ehr.cage VALUES ('c338-0025', 'c338', '0025', '32.75', '34.5', '33.25', null, null, '1010');
INSERT INTO ehr.cage VALUES ('c338-0026', 'c338', '0026', '32.75', '34.5', '33.25', null, null, '1011');
INSERT INTO ehr.cage VALUES ('c338-0027', 'c338', '0027', '32.75', '34.5', '33.25', null, null, '1012');
INSERT INTO ehr.cage VALUES ('c338-0028', 'c338', '0028', '32.75', '34.5', '33.25', null, null, '1013');
INSERT INTO ehr.cage VALUES ('c338-0029', 'c338', '0029', '32.75', '34.5', '33.25', null, null, '1014');
INSERT INTO ehr.cage VALUES ('c338-0030', 'c338', '0030', '32.75', '34.5', '33.25', null, null, '1015');
INSERT INTO ehr.cage VALUES ('c338-0031', 'c338', '0031', '32.75', '34.5', '33.25', null, null, '1016');
INSERT INTO ehr.cage VALUES ('c338-0032', 'c338', '0032', '32.75', '34.5', '33.25', null, null, '1017');
INSERT INTO ehr.cage VALUES ('c338-0033', 'c338', '0033', '32.75', '34.5', '33.25', null, null, '1018');
INSERT INTO ehr.cage VALUES ('c338-0034', 'c338', '0034', '32.75', '34.5', '33.25', null, null, '1019');
INSERT INTO ehr.cage VALUES ('c338-0035', 'c338', '0035', '32.75', '34.5', '33.25', null, null, '1020');
INSERT INTO ehr.cage VALUES ('c338-0036', 'c338', '0036', '32.75', '34.5', '33.25', null, null, '1021');
INSERT INTO ehr.cage VALUES ('c338-0037', 'c338', '0037', '32.75', '34.5', '33.25', null, null, '1022');
INSERT INTO ehr.cage VALUES ('c338-0038', 'c338', '0038', '32.75', '34.5', '33.25', null, null, '1023');
INSERT INTO ehr.cage VALUES ('c338-0039', 'c338', '0039', '32.75', '34.5', '33.25', null, null, '1024');
INSERT INTO ehr.cage VALUES ('c338-0040', 'c338', '0040', '32.75', '34.5', '33.25', null, null, '1025');
INSERT INTO ehr.cage VALUES ('c420-0001', 'c420', '0001', '27.75', '29.625', '30.75', null, null, '1026');
INSERT INTO ehr.cage VALUES ('c420-0002', 'c420', '0002', '27.75', '29.625', '30.75', null, null, '1027');
INSERT INTO ehr.cage VALUES ('c420-0003', 'c420', '0003', '27.75', '29.625', '30.75', null, null, '1028');
INSERT INTO ehr.cage VALUES ('c420-0004', 'c420', '0004', '27.75', '29.625', '30.75', null, null, '1029');
INSERT INTO ehr.cage VALUES ('c420-0005', 'c420', '0005', '27.75', '29.625', '30.75', null, null, '1030');
INSERT INTO ehr.cage VALUES ('c420-0006', 'c420', '0006', '27.75', '29.625', '30.75', null, null, '1031');
INSERT INTO ehr.cage VALUES ('c420-0007', 'c420', '0007', '27.75', '29.625', '30.75', null, null, '1032');
INSERT INTO ehr.cage VALUES ('c420-0008', 'c420', '0008', '27.75', '29.625', '30.75', null, null, '1033');
INSERT INTO ehr.cage VALUES ('c420-0009', 'c420', '0009', '27.75', '29.625', '30.75', null, null, '1034');
INSERT INTO ehr.cage VALUES ('c420-0010', 'c420', '0010', '27.75', '29.625', '30.75', null, null, '1035');
INSERT INTO ehr.cage VALUES ('c420-0011', 'c420', '0011', '27.75', '29.625', '30.75', null, null, '1036');
INSERT INTO ehr.cage VALUES ('c420-0012', 'c420', '0012', '27.75', '29.625', '30.75', null, null, '1037');
INSERT INTO ehr.cage VALUES ('c420-0013', 'c420', '0013', '27.75', '29.625', '30.75', null, null, '1038');
INSERT INTO ehr.cage VALUES ('c420-0014', 'c420', '0014', '27.75', '29.625', '30.75', null, null, '1039');
INSERT INTO ehr.cage VALUES ('c420-0015', 'c420', '0015', '27.75', '29.625', '30.75', null, null, '1040');
INSERT INTO ehr.cage VALUES ('c420-0016', 'c420', '0016', '27.75', '29.625', '30.75', null, null, '1041');
INSERT INTO ehr.cage VALUES ('c420-0017', 'c420', '0017', '27.75', '29.625', '30.75', null, null, '1042');
INSERT INTO ehr.cage VALUES ('c420-0018', 'c420', '0018', '27.75', '29.625', '30.75', null, null, '1043');
INSERT INTO ehr.cage VALUES ('c420-0019', 'c420', '0019', '27.75', '29.625', '30.75', null, null, '1044');
INSERT INTO ehr.cage VALUES ('c420-0020', 'c420', '0020', '27.75', '29.625', '30.75', null, null, '1045');
INSERT INTO ehr.cage VALUES ('c420-0021', 'c420', '0021', '27.75', '29.625', '30.75', null, null, '1046');
INSERT INTO ehr.cage VALUES ('c420-0022', 'c420', '0022', '27.75', '29.625', '30.75', null, null, '1047');
INSERT INTO ehr.cage VALUES ('c420-0023', 'c420', '0023', '27.75', '29.625', '30.75', null, null, '1048');
INSERT INTO ehr.cage VALUES ('c420-0024', 'c420', '0024', '27.75', '29.625', '30.75', null, null, '1049');
INSERT INTO ehr.cage VALUES ('c420-0025', 'c420', '0025', '27.75', '29.625', '30.75', null, null, '1050');
INSERT INTO ehr.cage VALUES ('c420-0026', 'c420', '0026', '27.75', '29.625', '30.75', null, null, '1051');
INSERT INTO ehr.cage VALUES ('c420-0027', 'c420', '0027', '27.75', '29.625', '30.75', null, null, '1052');
INSERT INTO ehr.cage VALUES ('c420-0028', 'c420', '0028', '27.75', '29.625', '30.75', null, null, '1053');
INSERT INTO ehr.cage VALUES ('c420-0029', 'c420', '0029', '27.75', '29.625', '30.75', null, null, '1054');
INSERT INTO ehr.cage VALUES ('c420-0030', 'c420', '0030', '27.75', '29.625', '30.75', null, null, '1055');
INSERT INTO ehr.cage VALUES ('c420-0031', 'c420', '0031', '27.75', '29.625', '30.75', null, null, '1056');
INSERT INTO ehr.cage VALUES ('c420-0032', 'c420', '0032', '27.75', '29.625', '30.75', null, null, '1057');
INSERT INTO ehr.cage VALUES ('c420-0033', 'c420', '0033', '27.75', '29.625', '30.75', null, null, '1058');
INSERT INTO ehr.cage VALUES ('c420-0034', 'c420', '0034', '27.75', '29.625', '30.75', null, null, '1059');
INSERT INTO ehr.cage VALUES ('c420-0035', 'c420', '0035', '27.75', '29.625', '30.75', null, null, '1060');
INSERT INTO ehr.cage VALUES ('c420-0036', 'c420', '0036', '27.75', '29.625', '30.75', null, null, '1061');
INSERT INTO ehr.cage VALUES ('c420-0037', 'c420', '0037', '27.75', '29.625', '30.75', null, null, '1062');
INSERT INTO ehr.cage VALUES ('c420-0038', 'c420', '0038', '27.75', '29.625', '30.75', null, null, '1063');
INSERT INTO ehr.cage VALUES ('c420-0039', 'c420', '0039', '27.75', '29.625', '30.75', null, null, '1064');
INSERT INTO ehr.cage VALUES ('c420-0040', 'c420', '0040', '27.75', '29.625', '30.75', null, null, '1065');
INSERT INTO ehr.cage VALUES ('c420-0041', 'c420', '0041', '27.75', '29.625', '30.75', null, null, '1066');
INSERT INTO ehr.cage VALUES ('c420-0042', 'c420', '0042', '27.75', '29.625', '30.75', null, null, '1067');
INSERT INTO ehr.cage VALUES ('c420-0043', 'c420', '0043', '27.75', '29.625', '30.75', null, null, '1068');
INSERT INTO ehr.cage VALUES ('c420-0044', 'c420', '0044', '27.75', '29.625', '30.75', null, null, '1069');
INSERT INTO ehr.cage VALUES ('c420-0045', 'c420', '0045', '27.75', '29.625', '30.75', null, null, '1070');
INSERT INTO ehr.cage VALUES ('c420-0046', 'c420', '0046', '27.75', '29.625', '30.75', null, null, '1071');
INSERT INTO ehr.cage VALUES ('c420-0047', 'c420', '0047', '27.75', '29.625', '30.75', null, null, '1072');
INSERT INTO ehr.cage VALUES ('c420-0048', 'c420', '0048', '27.75', '29.625', '30.75', null, null, '1073');
INSERT INTO ehr.cage VALUES ('c420-0049', 'c420', '0049', '27.75', '29.625', '30.75', null, null, '1074');
INSERT INTO ehr.cage VALUES ('c420-0050', 'c420', '0050', '27.75', '29.625', '30.75', null, null, '1075');
INSERT INTO ehr.cage VALUES ('c420-0051', 'c420', '0051', '27.75', '29.625', '30.75', null, null, '1076');
INSERT INTO ehr.cage VALUES ('c420-0052', 'c420', '0052', '27.75', '29.625', '30.75', null, null, '1077');
INSERT INTO ehr.cage VALUES ('c420-0053', 'c420', '0053', '27.75', '29.625', '30.75', null, null, '1078');
INSERT INTO ehr.cage VALUES ('c420-0054', 'c420', '0054', '27.75', '29.625', '30.75', null, null, '1079');
INSERT INTO ehr.cage VALUES ('c420-0055', 'c420', '0055', '27.75', '29.625', '30.75', null, null, '1080');
INSERT INTO ehr.cage VALUES ('c420-0056', 'c420', '0056', '27.75', '29.625', '30.75', null, null, '1081');
INSERT INTO ehr.cage VALUES ('c420-0057', 'c420', '0057', '27.75', '29.625', '30.75', null, null, '1082');
INSERT INTO ehr.cage VALUES ('c420-0058', 'c420', '0058', '27.75', '29.625', '30.75', null, null, '1083');
INSERT INTO ehr.cage VALUES ('c420-0059', 'c420', '0059', '27.75', '29.625', '30.75', null, null, '1084');
INSERT INTO ehr.cage VALUES ('c420-0060', 'c420', '0060', '27.75', '29.625', '30.75', null, null, '1085');
INSERT INTO ehr.cage VALUES ('c423-pen7', 'c423', 'pen7', '120', '78', '87', null, null, '1086');
INSERT INTO ehr.cage VALUES ('c423-pen8', 'c423', 'pen8', '120', '78', '87', null, null, '1087');
INSERT INTO ehr.cage VALUES ('c427-pen5', 'c427', 'pen5', '120', '78', '87', null, null, '1088');
INSERT INTO ehr.cage VALUES ('c427-pen6', 'c427', 'pen6', '120', '78', '87', null, null, '1089');
INSERT INTO ehr.cage VALUES ('c428c-0001', 'c428c', '0001', '28', '29.5', '31', null, null, '1090');
INSERT INTO ehr.cage VALUES ('c428c-0002', 'c428c', '0002', '28', '29.5', '31', null, null, '1091');
INSERT INTO ehr.cage VALUES ('c428c-0003', 'c428c', '0003', '28', '29.5', '31', null, null, '1092');
INSERT INTO ehr.cage VALUES ('c428c-0004', 'c428c', '0004', '28', '29.5', '31', null, null, '1093');
INSERT INTO ehr.cage VALUES ('c428c-0005', 'c428c', '0005', '28', '29.5', '31', null, null, '1094');
INSERT INTO ehr.cage VALUES ('c428c-0006', 'c428c', '0006', '28', '29.5', '31', null, null, '1095');
INSERT INTO ehr.cage VALUES ('c428c-0007', 'c428c', '0007', '28', '29.5', '31', null, null, '1096');
INSERT INTO ehr.cage VALUES ('c428c-0008', 'c428c', '0008', '28', '29.5', '31', null, null, '1097');
INSERT INTO ehr.cage VALUES ('c428c-0009', 'c428c', '0009', '28', '29.5', '31', null, null, '1098');
INSERT INTO ehr.cage VALUES ('c428c-0010', 'c428c', '0010', '28', '29.5', '31', null, null, '1099');
INSERT INTO ehr.cage VALUES ('c428c-0011', 'c428c', '0011', '28', '29.5', '31', null, null, '1100');
INSERT INTO ehr.cage VALUES ('c428c-0012', 'c428c', '0012', '28', '29.5', '31', null, null, '1101');
INSERT INTO ehr.cage VALUES ('c428c-0013', 'c428c', '0013', '28', '29.5', '31', null, null, '1102');
INSERT INTO ehr.cage VALUES ('c428c-0014', 'c428c', '0014', '28', '29.5', '31', null, null, '1103');
INSERT INTO ehr.cage VALUES ('c428c-0015', 'c428c', '0015', '28', '29.5', '31', null, null, '1104');
INSERT INTO ehr.cage VALUES ('c428c-0016', 'c428c', '0016', '28', '29.5', '31', null, null, '1105');
INSERT INTO ehr.cage VALUES ('c431-pen3', 'c431', 'pen3', '120', '78', '87', null, null, '1106');
INSERT INTO ehr.cage VALUES ('c431-pen4', 'c431', 'pen4', '120', '78', '87', null, null, '1107');
INSERT INTO ehr.cage VALUES ('c435-pen1', 'c435', 'pen1', '120', '78', '87', null, null, '1108');
INSERT INTO ehr.cage VALUES ('c435-pen2', 'c435', 'pen2', '120', '78', '87', null, null, '1109');
INSERT INTO ehr.cage VALUES ('c436-0001', 'c436', '0001', '33.75', '34.5', '33.75', null, null, '1110');
INSERT INTO ehr.cage VALUES ('c436-0002', 'c436', '0002', '33.75', '34.5', '33.75', null, null, '1111');
INSERT INTO ehr.cage VALUES ('c436-0003', 'c436', '0003', '33.75', '34.5', '33.75', null, null, '1112');
INSERT INTO ehr.cage VALUES ('c436-0004', 'c436', '0004', '33.75', '34.5', '33.75', null, null, '1113');
INSERT INTO ehr.cage VALUES ('c436-0005', 'c436', '0005', '33.75', '34.5', '36.75', null, null, '1114');
INSERT INTO ehr.cage VALUES ('c436-0006', 'c436', '0006', '33.75', '34.5', '36.75', null, null, '1115');
INSERT INTO ehr.cage VALUES ('c436-0007', 'c436', '0007', '33.75', '34.5', '36.75', null, null, '1116');
INSERT INTO ehr.cage VALUES ('c436-0008', 'c436', '0008', '33.75', '34.5', '36.75', null, null, '1117');
INSERT INTO ehr.cage VALUES ('c436-0009', 'c436', '0009', '33.75', '34.5', '33.75', null, null, '1118');
INSERT INTO ehr.cage VALUES ('c436-0010', 'c436', '0010', '33.75', '34.5', '33.75', null, null, '1119');
INSERT INTO ehr.cage VALUES ('c436-0011', 'c436', '0011', '33.75', '34.5', '33.75', null, null, '1120');
INSERT INTO ehr.cage VALUES ('c436-0012', 'c436', '0012', '33.75', '34.5', '33.75', null, null, '1121');
INSERT INTO ehr.cage VALUES ('c436-0013', 'c436', '0013', '33.75', '34.5', '36.75', null, null, '1122');
INSERT INTO ehr.cage VALUES ('c436-0014', 'c436', '0014', '33.75', '34.5', '36.75', null, null, '1123');
INSERT INTO ehr.cage VALUES ('c436-0015', 'c436', '0015', '33.75', '34.5', '36.75', null, null, '1124');
INSERT INTO ehr.cage VALUES ('c436-0016', 'c436', '0016', '33.75', '34.5', '36.75', null, null, '1125');
INSERT INTO ehr.cage VALUES ('c436-0017', 'c436', '0017', '33.75', '34.5', '33.75', null, null, '1126');
INSERT INTO ehr.cage VALUES ('c436-0018', 'c436', '0018', '33.75', '34.5', '33.75', null, null, '1127');
INSERT INTO ehr.cage VALUES ('c436-0019', 'c436', '0019', '33.75', '34.5', '33.75', null, null, '1128');
INSERT INTO ehr.cage VALUES ('c436-0020', 'c436', '0020', '33.75', '34.5', '33.75', null, null, '1129');
INSERT INTO ehr.cage VALUES ('c436-0021', 'c436', '0021', '33.75', '34.5', '36.75', null, null, '1130');
INSERT INTO ehr.cage VALUES ('c436-0022', 'c436', '0022', '33.75', '34.5', '36.75', null, null, '1131');
INSERT INTO ehr.cage VALUES ('c436-0023', 'c436', '0023', '33.75', '34.5', '36.75', null, null, '1132');
INSERT INTO ehr.cage VALUES ('c436-0024', 'c436', '0024', '33.75', '34.5', '36.75', null, null, '1133');
INSERT INTO ehr.cage VALUES ('c436-0025', 'c436', '0025', '33.75', '34.5', '33.75', null, null, '1134');
INSERT INTO ehr.cage VALUES ('c436-0026', 'c436', '0026', '33.75', '34.5', '33.75', null, null, '1135');
INSERT INTO ehr.cage VALUES ('c436-0027', 'c436', '0027', '33.75', '34.5', '33.75', null, null, '1136');
INSERT INTO ehr.cage VALUES ('c436-0028', 'c436', '0028', '33.75', '34.5', '33.75', null, null, '1137');
INSERT INTO ehr.cage VALUES ('c436-0029', 'c436', '0029', '33.75', '34.5', '36.75', null, null, '1138');
INSERT INTO ehr.cage VALUES ('c436-0030', 'c436', '0030', '33.75', '34.5', '36.75', null, null, '1139');
INSERT INTO ehr.cage VALUES ('c436-0031', 'c436', '0031', '33.75', '34.5', '36.75', null, null, '1140');
INSERT INTO ehr.cage VALUES ('c436-0032', 'c436', '0032', '33.75', '34.5', '36.75', null, null, '1141');
INSERT INTO ehr.cage VALUES ('c436-0033', 'c436', '0033', '33.75', '34.5', '33.75', null, null, '1142');
INSERT INTO ehr.cage VALUES ('c436-0034', 'c436', '0034', '33.75', '34.5', '33.75', null, null, '1143');
INSERT INTO ehr.cage VALUES ('c436-0035', 'c436', '0035', '33.75', '34.5', '33.75', null, null, '1144');
INSERT INTO ehr.cage VALUES ('c436-0036', 'c436', '0036', '33.75', '34.5', '33.75', null, null, '1145');
INSERT INTO ehr.cage VALUES ('c436-0037', 'c436', '0037', '33.75', '34.5', '36.75', null, null, '1146');
INSERT INTO ehr.cage VALUES ('c436-0038', 'c436', '0038', '33.75', '34.5', '36.75', null, null, '1147');
INSERT INTO ehr.cage VALUES ('c436-0039', 'c436', '0039', '33.75', '34.5', '36.75', null, null, '1148');
INSERT INTO ehr.cage VALUES ('c436-0040', 'c436', '0040', '33.75', '34.5', '36.75', null, null, '1149');
INSERT INTO ehr.cage VALUES ('cb11-0001', 'cb11', '0001', '32.875', '33.75', '33.75', null, null, '1150');
INSERT INTO ehr.cage VALUES ('cb11-0002', 'cb11', '0002', '32.875', '33.75', '33.75', null, null, '1151');
INSERT INTO ehr.cage VALUES ('cb11-0003', 'cb11', '0003', '32.875', '33.75', '33.75', null, null, '1152');
INSERT INTO ehr.cage VALUES ('cb11-0004', 'cb11', '0004', '32.875', '33.75', '33.75', null, null, '1153');
INSERT INTO ehr.cage VALUES ('cb11-0005', 'cb11', '0005', '32.875', '33.75', '33.75', null, null, '1154');
INSERT INTO ehr.cage VALUES ('cb11-0006', 'cb11', '0006', '32.875', '33.75', '33.75', null, null, '1155');
INSERT INTO ehr.cage VALUES ('cb11-0007', 'cb11', '0007', '32.875', '33.75', '33.75', null, null, '1156');
INSERT INTO ehr.cage VALUES ('cb11-0008', 'cb11', '0008', '32.875', '33.75', '33.75', null, null, '1157');
INSERT INTO ehr.cage VALUES ('cb11-0009', 'cb11', '0009', '32.875', '33.75', '33.75', null, null, '1158');
INSERT INTO ehr.cage VALUES ('cb11-0010', 'cb11', '0010', '32.875', '33.75', '33.75', null, null, '1159');
INSERT INTO ehr.cage VALUES ('cb11-0011', 'cb11', '0011', '32.875', '33.75', '33.75', null, null, '1160');
INSERT INTO ehr.cage VALUES ('cb11-0012', 'cb11', '0012', '32.875', '33.75', '33.75', null, null, '1161');
INSERT INTO ehr.cage VALUES ('cb11-0013', 'cb11', '0013', '32.875', '33.75', '33.75', null, null, '1162');
INSERT INTO ehr.cage VALUES ('cb11-0014', 'cb11', '0014', '32.875', '33.75', '33.75', null, null, '1163');
INSERT INTO ehr.cage VALUES ('cb11-0015', 'cb11', '0015', '32.875', '33.75', '33.75', null, null, '1164');
INSERT INTO ehr.cage VALUES ('cb11-0016', 'cb11', '0016', '32.875', '33.75', '33.75', null, null, '1165');
INSERT INTO ehr.cage VALUES ('cb11-0017', 'cb11', '0017', '32.875', '33.75', '33.75', null, null, '1166');
INSERT INTO ehr.cage VALUES ('cb11-0018', 'cb11', '0018', '32.875', '33.75', '33.75', null, null, '1167');
INSERT INTO ehr.cage VALUES ('cb11-0019', 'cb11', '0019', '32.875', '33.75', '33.75', null, null, '1168');
INSERT INTO ehr.cage VALUES ('cb11-0020', 'cb11', '0020', '32.875', '33.75', '33.75', null, null, '1169');
INSERT INTO ehr.cage VALUES ('cb11-0021', 'cb11', '0021', '32.875', '33.75', '33.75', null, null, '1170');
INSERT INTO ehr.cage VALUES ('cb11-0022', 'cb11', '0022', '32.875', '33.75', '33.75', null, null, '1171');
INSERT INTO ehr.cage VALUES ('cb11-0023', 'cb11', '0023', '32.875', '33.75', '33.75', null, null, '1172');
INSERT INTO ehr.cage VALUES ('cb11-0024', 'cb11', '0024', '32.875', '33.75', '33.75', null, null, '1173');
INSERT INTO ehr.cage VALUES ('cb11-0025', 'cb11', '0025', '32.875', '33.75', '33.75', null, null, '1174');
INSERT INTO ehr.cage VALUES ('cb11-0026', 'cb11', '0026', '32.875', '33.75', '33.75', null, null, '1175');
INSERT INTO ehr.cage VALUES ('cb11-0027', 'cb11', '0027', '32.875', '33.75', '33.75', null, null, '1176');
INSERT INTO ehr.cage VALUES ('cb11-0028', 'cb11', '0028', '32.875', '33.75', '33.75', null, null, '1177');
INSERT INTO ehr.cage VALUES ('cb11-0029', 'cb11', '0029', '32.875', '33.75', '33.75', null, null, '1178');
INSERT INTO ehr.cage VALUES ('cb11-0030', 'cb11', '0030', '32.875', '33.75', '33.75', null, null, '1179');
INSERT INTO ehr.cage VALUES ('cb11-0031', 'cb11', '0031', '32.875', '33.75', '33.75', null, null, '1180');
INSERT INTO ehr.cage VALUES ('cb11-0032', 'cb11', '0032', '32.875', '33.75', '33.75', null, null, '1181');
INSERT INTO ehr.cage VALUES ('cb11-0033', 'cb11', '0033', '32.875', '33.75', '33.75', null, null, '1182');
INSERT INTO ehr.cage VALUES ('cb11-0034', 'cb11', '0034', '32.875', '33.75', '33.75', null, null, '1183');
INSERT INTO ehr.cage VALUES ('cb11-0035', 'cb11', '0035', '32.875', '33.75', '33.75', null, null, '1184');
INSERT INTO ehr.cage VALUES ('cb11-0036', 'cb11', '0036', '32.875', '33.75', '33.75', null, null, '1185');
INSERT INTO ehr.cage VALUES ('cb11-0037', 'cb11', '0037', '32.875', '33.75', '33.75', null, null, '1186');
INSERT INTO ehr.cage VALUES ('cb11-0038', 'cb11', '0038', '32.875', '33.75', '33.75', null, null, '1187');
INSERT INTO ehr.cage VALUES ('cb11-0039', 'cb11', '0039', '32.875', '33.75', '33.75', null, null, '1188');
INSERT INTO ehr.cage VALUES ('cb11-0040', 'cb11', '0040', '32.875', '33.75', '33.75', null, null, '1189');
INSERT INTO ehr.cage VALUES ('cb11-0041', 'cb11', '0041', '32.875', '33.75', '33.75', null, null, '1190');
INSERT INTO ehr.cage VALUES ('cb11-0042', 'cb11', '0042', '32.875', '33.75', '33.75', null, null, '1191');
INSERT INTO ehr.cage VALUES ('cb11-0043', 'cb11', '0043', '32.875', '33.75', '33.75', null, null, '1192');
INSERT INTO ehr.cage VALUES ('cb11-0044', 'cb11', '0044', '32.875', '33.75', '33.75', null, null, '1193');
INSERT INTO ehr.cage VALUES ('cb11-0045', 'cb11', '0045', '32.875', '33.75', '33.75', null, null, '1194');
INSERT INTO ehr.cage VALUES ('cb11-0046', 'cb11', '0046', '32.875', '33.75', '33.75', null, null, '1195');
INSERT INTO ehr.cage VALUES ('cb11-0047', 'cb11', '0047', '32.875', '33.75', '33.75', null, null, '1196');
INSERT INTO ehr.cage VALUES ('cb11-0048', 'cb11', '0048', '32.875', '33.75', '33.75', null, null, '1197');
INSERT INTO ehr.cage VALUES ('cb11-0049', 'cb11', '0049', '32.875', '33.75', '33.75', null, null, '1198');
INSERT INTO ehr.cage VALUES ('cb11-0050', 'cb11', '0050', '32.875', '33.75', '33.75', null, null, '1199');
INSERT INTO ehr.cage VALUES ('cb11-0051', 'cb11', '0051', '32.875', '33.75', '33.75', null, null, '1200');
INSERT INTO ehr.cage VALUES ('cb11-0052', 'cb11', '0052', '32.875', '33.75', '33.75', null, null, '1201');
INSERT INTO ehr.cage VALUES ('cb11-0053', 'cb11', '0053', '32.875', '33.75', '33.75', null, null, '1202');
INSERT INTO ehr.cage VALUES ('cb11-0054', 'cb11', '0054', '32.875', '33.75', '33.75', null, null, '1203');
INSERT INTO ehr.cage VALUES ('cb11-0055', 'cb11', '0055', '32.875', '33.75', '33.75', null, null, '1204');
INSERT INTO ehr.cage VALUES ('cb11-0056', 'cb11', '0056', '32.875', '33.75', '33.75', null, null, '1205');
INSERT INTO ehr.cage VALUES ('cb11-0057', 'cb11', '0057', '32.875', '33.75', '33.75', null, null, '1206');
INSERT INTO ehr.cage VALUES ('cb11-0058', 'cb11', '0058', '32.875', '33.75', '33.75', null, null, '1207');
INSERT INTO ehr.cage VALUES ('cb11-0059', 'cb11', '0059', '32.875', '33.75', '33.75', null, null, '1208');
INSERT INTO ehr.cage VALUES ('cb11-0060', 'cb11', '0060', '32.875', '33.75', '33.75', null, null, '1209');
INSERT INTO ehr.cage VALUES ('cb11-0061', 'cb11', '0061', '32.875', '33.75', '33.75', null, null, '1210');
INSERT INTO ehr.cage VALUES ('cb11-0062', 'cb11', '0062', '32.875', '33.75', '33.75', null, null, '1211');
INSERT INTO ehr.cage VALUES ('cb11-0063', 'cb11', '0063', '32.875', '33.75', '33.75', null, null, '1212');
INSERT INTO ehr.cage VALUES ('cb11-0064', 'cb11', '0064', '32.875', '33.75', '33.75', null, null, '1213');
INSERT INTO ehr.cage VALUES ('cb11-0065', 'cb11', '0065', '32.875', '33.75', '33.75', null, null, '1214');
INSERT INTO ehr.cage VALUES ('cb11-0066', 'cb11', '0066', '32.875', '33.75', '33.75', null, null, '1215');
INSERT INTO ehr.cage VALUES ('cb11-0067', 'cb11', '0067', '32.875', '33.75', '33.75', null, null, '1216');
INSERT INTO ehr.cage VALUES ('cb11-0068', 'cb11', '0068', '32.875', '33.75', '33.75', null, null, '1217');
INSERT INTO ehr.cage VALUES ('cb11-0069', 'cb11', '0069', '32.875', '33.75', '33.75', null, null, '1218');
INSERT INTO ehr.cage VALUES ('cb11-0070', 'cb11', '0070', '32.875', '33.75', '33.75', null, null, '1219');
INSERT INTO ehr.cage VALUES ('cb11-0071', 'cb11', '0071', '32.875', '33.75', '33.75', null, null, '1220');
INSERT INTO ehr.cage VALUES ('cb11-0072', 'cb11', '0072', '32.875', '33.75', '33.75', null, null, '1221');
INSERT INTO ehr.cage VALUES ('cb11-0073', 'cb11', '0073', '32.875', '33.75', '33.75', null, null, '1222');
INSERT INTO ehr.cage VALUES ('cb11-0074', 'cb11', '0074', '32.875', '33.75', '33.75', null, null, '1223');
INSERT INTO ehr.cage VALUES ('cb11-0075', 'cb11', '0075', '32.875', '33.75', '33.75', null, null, '1224');
INSERT INTO ehr.cage VALUES ('cb11-0076', 'cb11', '0076', '32.875', '33.75', '33.75', null, null, '1225');
INSERT INTO ehr.cage VALUES ('cb11-0077', 'cb11', '0077', '32.875', '33.75', '33.75', null, null, '1226');
INSERT INTO ehr.cage VALUES ('cb11-0078', 'cb11', '0078', '32.875', '33.75', '33.75', null, null, '1227');
INSERT INTO ehr.cage VALUES ('cb11-0079', 'cb11', '0079', '32.875', '33.75', '33.75', null, null, '1228');
INSERT INTO ehr.cage VALUES ('cb11-0080', 'cb11', '0080', '32.875', '33.75', '33.75', null, null, '1229');
INSERT INTO ehr.cage VALUES ('cb22-0001', 'cb22', '0001', '33.75', '34.5', '33.75', null, null, '1230');
INSERT INTO ehr.cage VALUES ('cb22-0002', 'cb22', '0002', '33.75', '34.5', '33.75', null, null, '1231');
INSERT INTO ehr.cage VALUES ('cb22-0003', 'cb22', '0003', '33.75', '34.5', '33.75', null, null, '1232');
INSERT INTO ehr.cage VALUES ('cb22-0004', 'cb22', '0004', '33.75', '34.5', '33.75', null, null, '1233');
INSERT INTO ehr.cage VALUES ('cb22-0005', 'cb22', '0005', '33.75', '34.5', '36.75', null, null, '1234');
INSERT INTO ehr.cage VALUES ('cb22-0006', 'cb22', '0006', '33.75', '34.5', '36.75', null, null, '1235');
INSERT INTO ehr.cage VALUES ('cb22-0007', 'cb22', '0007', '33.75', '34.5', '36.75', null, null, '1236');
INSERT INTO ehr.cage VALUES ('cb22-0008', 'cb22', '0008', '33.75', '34.5', '36.75', null, null, '1237');
INSERT INTO ehr.cage VALUES ('cb22-0009', 'cb22', '0009', '33.75', '34.5', '33.75', null, null, '1238');
INSERT INTO ehr.cage VALUES ('cb22-0010', 'cb22', '0010', '33.75', '34.5', '33.75', null, null, '1239');
INSERT INTO ehr.cage VALUES ('cb22-0011', 'cb22', '0011', '33.75', '34.5', '33.75', null, null, '1240');
INSERT INTO ehr.cage VALUES ('cb22-0012', 'cb22', '0012', '33.75', '34.5', '33.75', null, null, '1241');
INSERT INTO ehr.cage VALUES ('cb22-0013', 'cb22', '0013', '33.75', '34.5', '36.75', null, null, '1242');
INSERT INTO ehr.cage VALUES ('cb22-0014', 'cb22', '0014', '33.75', '34.5', '36.75', null, null, '1243');
INSERT INTO ehr.cage VALUES ('cb22-0015', 'cb22', '0015', '33.75', '34.5', '36.75', null, null, '1244');
INSERT INTO ehr.cage VALUES ('cb22-0016', 'cb22', '0016', '33.75', '34.5', '36.75', null, null, '1245');
INSERT INTO ehr.cage VALUES ('cb22-0017', 'cb22', '0017', '33.75', '34.5', '33.75', null, null, '1246');
INSERT INTO ehr.cage VALUES ('cb22-0018', 'cb22', '0018', '33.75', '34.5', '33.75', null, null, '1247');
INSERT INTO ehr.cage VALUES ('cb22-0019', 'cb22', '0019', '33.75', '34.5', '33.75', null, null, '1248');
INSERT INTO ehr.cage VALUES ('cb22-0020', 'cb22', '0020', '33.75', '34.5', '33.75', null, null, '1249');
INSERT INTO ehr.cage VALUES ('cb22-0021', 'cb22', '0021', '33.75', '34.5', '36.75', null, null, '1250');
INSERT INTO ehr.cage VALUES ('cb22-0022', 'cb22', '0022', '33.75', '34.5', '36.75', null, null, '1251');
INSERT INTO ehr.cage VALUES ('cb22-0023', 'cb22', '0023', '33.75', '34.5', '36.75', null, null, '1252');
INSERT INTO ehr.cage VALUES ('cb22-0024', 'cb22', '0024', '33.75', '34.5', '36.75', null, null, '1253');
INSERT INTO ehr.cage VALUES ('cb22-0025', 'cb22', '0025', '33.75', '34.5', '33.75', null, null, '1254');
INSERT INTO ehr.cage VALUES ('cb22-0026', 'cb22', '0026', '33.75', '34.5', '33.75', null, null, '1255');
INSERT INTO ehr.cage VALUES ('cb22-0027', 'cb22', '0027', '33.75', '34.5', '33.75', null, null, '1256');
INSERT INTO ehr.cage VALUES ('cb22-0028', 'cb22', '0028', '33.75', '34.5', '33.75', null, null, '1257');
INSERT INTO ehr.cage VALUES ('cb22-0029', 'cb22', '0029', '33.75', '34.5', '36.75', null, null, '1258');
INSERT INTO ehr.cage VALUES ('cb22-0030', 'cb22', '0030', '33.75', '34.5', '36.75', null, null, '1259');
INSERT INTO ehr.cage VALUES ('cb22-0031', 'cb22', '0031', '33.75', '34.5', '36.75', null, null, '1260');
INSERT INTO ehr.cage VALUES ('cb22-0032', 'cb22', '0032', '33.75', '34.5', '36.75', null, null, '1261');
INSERT INTO ehr.cage VALUES ('cb22-0033', 'cb22', '0033', '33.75', '34.5', '33.75', null, null, '1262');
INSERT INTO ehr.cage VALUES ('cb22-0034', 'cb22', '0034', '33.75', '34.5', '33.75', null, null, '1263');
INSERT INTO ehr.cage VALUES ('cb22-0035', 'cb22', '0035', '33.75', '34.5', '33.75', null, null, '1264');
INSERT INTO ehr.cage VALUES ('cb22-0036', 'cb22', '0036', '33.75', '34.5', '33.75', null, null, '1265');
INSERT INTO ehr.cage VALUES ('cb22-0037', 'cb22', '0037', '33.75', '34.5', '36.75', null, null, '1266');
INSERT INTO ehr.cage VALUES ('cb22-0038', 'cb22', '0038', '33.75', '34.5', '36.75', null, null, '1267');
INSERT INTO ehr.cage VALUES ('cb22-0039', 'cb22', '0039', '33.75', '34.5', '36.75', null, null, '1268');
INSERT INTO ehr.cage VALUES ('cb22-0040', 'cb22', '0040', '33.75', '34.5', '36.75', null, null, '1269');
INSERT INTO ehr.cage VALUES ('cb27-0001', 'cb27', '0001', '32.75', '34.5', '33.25', null, null, '1270');
INSERT INTO ehr.cage VALUES ('cb27-0002', 'cb27', '0002', '32.75', '34.5', '33.25', null, null, '1271');
INSERT INTO ehr.cage VALUES ('cb27-0003', 'cb27', '0003', '32.75', '34.5', '33.25', null, null, '1272');
INSERT INTO ehr.cage VALUES ('cb27-0004', 'cb27', '0004', '32.75', '34.5', '33.25', null, null, '1273');
INSERT INTO ehr.cage VALUES ('cb27-0005', 'cb27', '0005', '32.75', '34.5', '33.25', null, null, '1274');
INSERT INTO ehr.cage VALUES ('cb27-0006', 'cb27', '0006', '32.75', '34.5', '33.25', null, null, '1275');
INSERT INTO ehr.cage VALUES ('cb27-0007', 'cb27', '0007', '32.75', '34.5', '33.25', null, null, '1276');
INSERT INTO ehr.cage VALUES ('cb27-0008', 'cb27', '0008', '32.75', '34.5', '33.25', null, null, '1277');
INSERT INTO ehr.cage VALUES ('cb27-0009', 'cb27', '0009', '32.75', '34.5', '33.25', null, null, '1278');
INSERT INTO ehr.cage VALUES ('cb27-0010', 'cb27', '0010', '32.75', '34.5', '33.25', null, null, '1279');
INSERT INTO ehr.cage VALUES ('cb27-0011', 'cb27', '0011', '32.75', '34.5', '33.25', null, null, '1280');
INSERT INTO ehr.cage VALUES ('cb27-0012', 'cb27', '0012', '32.75', '34.5', '33.25', null, null, '1281');
INSERT INTO ehr.cage VALUES ('cb27-0013', 'cb27', '0013', '32.75', '34.5', '33.25', null, null, '1282');
INSERT INTO ehr.cage VALUES ('cb27-0014', 'cb27', '0014', '32.75', '34.5', '33.25', null, null, '1283');
INSERT INTO ehr.cage VALUES ('cb27-0015', 'cb27', '0015', '32.75', '34.5', '33.25', null, null, '1284');
INSERT INTO ehr.cage VALUES ('cb27-0016', 'cb27', '0016', '32.75', '34.5', '33.25', null, null, '1285');
INSERT INTO ehr.cage VALUES ('cb28-0001', 'cb28', '0001', '32.75', '34.5', '33.25', null, null, '1286');
INSERT INTO ehr.cage VALUES ('cb28-0002', 'cb28', '0002', '32.75', '34.5', '33.25', null, null, '1287');
INSERT INTO ehr.cage VALUES ('cb28-0003', 'cb28', '0003', '32.75', '34.5', '33.25', null, null, '1288');
INSERT INTO ehr.cage VALUES ('cb28-0004', 'cb28', '0004', '32.75', '34.5', '33.25', null, null, '1289');
INSERT INTO ehr.cage VALUES ('cb28-0005', 'cb28', '0005', '32.75', '34.5', '33.25', null, null, '1290');
INSERT INTO ehr.cage VALUES ('cb28-0006', 'cb28', '0006', '32.75', '34.5', '33.25', null, null, '1291');
INSERT INTO ehr.cage VALUES ('cb28-0007', 'cb28', '0007', '32.75', '34.5', '33.25', null, null, '1292');
INSERT INTO ehr.cage VALUES ('cb28-0008', 'cb28', '0008', '32.75', '34.5', '33.25', null, null, '1293');
INSERT INTO ehr.cage VALUES ('cb28-0009', 'cb28', '0009', '32.75', '34.5', '33.25', null, null, '1294');
INSERT INTO ehr.cage VALUES ('cb28-0010', 'cb28', '0010', '32.75', '34.5', '33.25', null, null, '1295');
INSERT INTO ehr.cage VALUES ('cb28-0011', 'cb28', '0011', '32.75', '34.5', '33.25', null, null, '1296');
INSERT INTO ehr.cage VALUES ('cb28-0012', 'cb28', '0012', '32.75', '34.5', '33.25', null, null, '1297');
INSERT INTO ehr.cage VALUES ('cb28-0013', 'cb28', '0013', '32.75', '34.5', '33.25', null, null, '1298');
INSERT INTO ehr.cage VALUES ('cb28-0014', 'cb28', '0014', '32.75', '34.5', '33.25', null, null, '1299');
INSERT INTO ehr.cage VALUES ('cb28-0015', 'cb28', '0015', '32.75', '34.5', '33.25', null, null, '1300');
INSERT INTO ehr.cage VALUES ('cb28-0016', 'cb28', '0016', '32.75', '34.5', '33.25', null, null, '1301');
INSERT INTO ehr.cage VALUES ('cb30-0001', 'cb30', '0001', '32.75', '34.5', '33.25', null, null, '1302');
INSERT INTO ehr.cage VALUES ('cb30-0002', 'cb30', '0002', '32.75', '34.5', '33.25', null, null, '1303');
INSERT INTO ehr.cage VALUES ('cb30-0003', 'cb30', '0003', '32.75', '34.5', '33.25', null, null, '1304');
INSERT INTO ehr.cage VALUES ('cb30-0004', 'cb30', '0004', '32.75', '34.5', '33.25', null, null, '1305');
INSERT INTO ehr.cage VALUES ('cb30-0005', 'cb30', '0005', '32.75', '34.5', '33.25', null, null, '1306');
INSERT INTO ehr.cage VALUES ('cb30-0006', 'cb30', '0006', '32.75', '34.5', '33.25', null, null, '1307');
INSERT INTO ehr.cage VALUES ('cb30-0007', 'cb30', '0007', '32.75', '34.5', '33.25', null, null, '1308');
INSERT INTO ehr.cage VALUES ('cb30-0008', 'cb30', '0008', '32.75', '34.5', '33.25', null, null, '1309');
INSERT INTO ehr.cage VALUES ('cb30-0009', 'cb30', '0009', '32.75', '34.5', '33.25', null, null, '1310');
INSERT INTO ehr.cage VALUES ('cb30-0010', 'cb30', '0010', '32.75', '34.5', '33.25', null, null, '1311');
INSERT INTO ehr.cage VALUES ('cb30-0011', 'cb30', '0011', '32.75', '34.5', '33.25', null, null, '1312');
INSERT INTO ehr.cage VALUES ('cb30-0012', 'cb30', '0012', '32.75', '34.5', '33.25', null, null, '1313');
INSERT INTO ehr.cage VALUES ('cb30-0013', 'cb30', '0013', '32.75', '34.5', '33.25', null, null, '1314');
INSERT INTO ehr.cage VALUES ('cb30-0014', 'cb30', '0014', '32.75', '34.5', '33.25', null, null, '1315');
INSERT INTO ehr.cage VALUES ('cb30-0015', 'cb30', '0015', '32.75', '34.5', '33.25', null, null, '1316');
INSERT INTO ehr.cage VALUES ('cb30-0016', 'cb30', '0016', '32.75', '34.5', '33.25', null, null, '1317');
INSERT INTO ehr.cage VALUES ('cb30-0017', 'cb30', '0017', '32.75', '34.5', '33.25', null, null, '1318');
INSERT INTO ehr.cage VALUES ('cb30-0018', 'cb30', '0018', '32.75', '34.5', '33.25', null, null, '1319');
INSERT INTO ehr.cage VALUES ('cb30-0019', 'cb30', '0019', '32.75', '34.5', '33.25', null, null, '1320');
INSERT INTO ehr.cage VALUES ('cb30-0020', 'cb30', '0020', '32.75', '34.5', '33.25', null, null, '1321');
INSERT INTO ehr.cage VALUES ('cb30-0021', 'cb30', '0021', '32.75', '34.5', '33.25', null, null, '1322');
INSERT INTO ehr.cage VALUES ('cb30-0022', 'cb30', '0022', '32.75', '34.5', '33.25', null, null, '1323');
INSERT INTO ehr.cage VALUES ('cb30-0023', 'cb30', '0023', '32.75', '34.5', '33.25', null, null, '1324');
INSERT INTO ehr.cage VALUES ('cb30-0024', 'cb30', '0024', '32.75', '34.5', '33.25', null, null, '1325');
INSERT INTO ehr.cage VALUES ('cb30-0025', 'cb30', '0025', '32.75', '34.5', '33.25', null, null, '1326');
INSERT INTO ehr.cage VALUES ('cb30-0026', 'cb30', '0026', '32.75', '34.5', '33.25', null, null, '1327');
INSERT INTO ehr.cage VALUES ('cb30-0027', 'cb30', '0027', '32.75', '34.5', '33.25', null, null, '1328');
INSERT INTO ehr.cage VALUES ('cb30-0028', 'cb30', '0028', '32.75', '34.5', '33.25', null, null, '1329');
INSERT INTO ehr.cage VALUES ('cb30-0029', 'cb30', '0029', '32.75', '34.5', '33.25', null, null, '1330');
INSERT INTO ehr.cage VALUES ('cb30-0030', 'cb30', '0030', '32.75', '34.5', '33.25', null, null, '1331');
INSERT INTO ehr.cage VALUES ('cb30-0031', 'cb30', '0031', '32.75', '34.5', '33.25', null, null, '1332');
INSERT INTO ehr.cage VALUES ('cb30-0032', 'cb30', '0032', '32.75', '34.5', '33.25', null, null, '1333');
INSERT INTO ehr.cage VALUES ('cb30-0033', 'cb30', '0033', '32.75', '34.5', '33.25', null, null, '1334');
INSERT INTO ehr.cage VALUES ('cb30-0034', 'cb30', '0034', '32.75', '34.5', '33.25', null, null, '1335');
INSERT INTO ehr.cage VALUES ('cb30-0035', 'cb30', '0035', '32.75', '34.5', '33.25', null, null, '1336');
INSERT INTO ehr.cage VALUES ('cb30-0036', 'cb30', '0036', '32.75', '34.5', '33.25', null, null, '1337');
INSERT INTO ehr.cage VALUES ('cb35-0001', 'cb35', '0001', '32.75', '34.5', '33.25', null, null, '1338');
INSERT INTO ehr.cage VALUES ('cb35-0002', 'cb35', '0002', '32.75', '34.5', '33.25', null, null, '1339');
INSERT INTO ehr.cage VALUES ('cb35-0003', 'cb35', '0003', '32.75', '34.5', '33.25', null, null, '1340');
INSERT INTO ehr.cage VALUES ('cb35-0004', 'cb35', '0004', '32.75', '34.5', '33.25', null, null, '1341');
INSERT INTO ehr.cage VALUES ('cb35-0005', 'cb35', '0005', '32.75', '34.5', '33.25', null, null, '1342');
INSERT INTO ehr.cage VALUES ('cb35-0006', 'cb35', '0006', '32.75', '34.5', '33.25', null, null, '1343');
INSERT INTO ehr.cage VALUES ('cb35-0007', 'cb35', '0007', '32.75', '34.5', '33.25', null, null, '1344');
INSERT INTO ehr.cage VALUES ('cb35-0008', 'cb35', '0008', '32.75', '34.5', '33.25', null, null, '1345');
INSERT INTO ehr.cage VALUES ('cb35-0009', 'cb35', '0009', '32.75', '34.5', '33.25', null, null, '1346');
INSERT INTO ehr.cage VALUES ('cb35-0010', 'cb35', '0010', '32.75', '34.5', '33.25', null, null, '1347');
INSERT INTO ehr.cage VALUES ('cb35-0011', 'cb35', '0011', '32.75', '34.5', '33.25', null, null, '1348');
INSERT INTO ehr.cage VALUES ('cb35-0012', 'cb35', '0012', '32.75', '34.5', '33.25', null, null, '1349');
INSERT INTO ehr.cage VALUES ('cb35-0013', 'cb35', '0013', '32.75', '34.5', '33.25', null, null, '1350');
INSERT INTO ehr.cage VALUES ('cb35-0014', 'cb35', '0014', '32.75', '34.5', '33.25', null, null, '1351');
INSERT INTO ehr.cage VALUES ('cb35-0015', 'cb35', '0015', '32.75', '34.5', '33.25', null, null, '1352');
INSERT INTO ehr.cage VALUES ('cb35-0016', 'cb35', '0016', '32.75', '34.5', '33.25', null, null, '1353');
INSERT INTO ehr.cage VALUES ('cb36-0001', 'cb36', '0001', '32.75', '34.5', '33.25', null, null, '1354');
INSERT INTO ehr.cage VALUES ('cb36-0002', 'cb36', '0002', '32.75', '34.5', '33.25', null, null, '1355');
INSERT INTO ehr.cage VALUES ('cb36-0003', 'cb36', '0003', '32.75', '34.5', '33.25', null, null, '1356');
INSERT INTO ehr.cage VALUES ('cb36-0004', 'cb36', '0004', '32.75', '34.5', '33.25', null, null, '1357');
INSERT INTO ehr.cage VALUES ('cb36-0005', 'cb36', '0005', '32.75', '34.5', '33.25', null, null, '1358');
INSERT INTO ehr.cage VALUES ('cb36-0006', 'cb36', '0006', '32.75', '34.5', '33.25', null, null, '1359');
INSERT INTO ehr.cage VALUES ('cb36-0007', 'cb36', '0007', '32.75', '34.5', '33.25', null, null, '1360');
INSERT INTO ehr.cage VALUES ('cb36-0008', 'cb36', '0008', '32.75', '34.5', '33.25', null, null, '1361');
INSERT INTO ehr.cage VALUES ('cb36-0009', 'cb36', '0009', '32.75', '34.5', '33.25', null, null, '1362');
INSERT INTO ehr.cage VALUES ('cb36-0010', 'cb36', '0010', '32.75', '34.5', '33.25', null, null, '1363');
INSERT INTO ehr.cage VALUES ('cb36-0011', 'cb36', '0011', '32.75', '34.5', '33.25', null, null, '1364');
INSERT INTO ehr.cage VALUES ('cb36-0012', 'cb36', '0012', '32.75', '34.5', '33.25', null, null, '1365');
INSERT INTO ehr.cage VALUES ('cb36-0013', 'cb36', '0013', '32.75', '34.5', '33.25', null, null, '1366');
INSERT INTO ehr.cage VALUES ('cb36-0014', 'cb36', '0014', '32.75', '34.5', '33.25', null, null, '1367');
INSERT INTO ehr.cage VALUES ('cb36-0015', 'cb36', '0015', '32.75', '34.5', '33.25', null, null, '1368');
INSERT INTO ehr.cage VALUES ('cb36-0016', 'cb36', '0016', '32.75', '34.5', '33.25', null, null, '1369');
INSERT INTO ehr.cage VALUES ('cif1380-0001', 'cif1380', '0001', '24', '26.1', '33', null, null, '1370');
INSERT INTO ehr.cage VALUES ('cif1380-0002', 'cif1380', '0002', '24', '26.1', '33', null, null, '1371');
INSERT INTO ehr.cage VALUES ('cif1380-0003', 'cif1380', '0003', '24', '26.1', '33', null, null, '1372');
INSERT INTO ehr.cage VALUES ('cif1380-0004', 'cif1380', '0004', '24', '26.1', '33', null, null, '1373');
INSERT INTO ehr.cage VALUES ('cif1380-0005', 'cif1380', '0005', '24', '26.1', '33', null, null, '1374');
INSERT INTO ehr.cage VALUES ('cif1380-0006', 'cif1380', '0006', '24', '26.1', '33', null, null, '1375');
INSERT INTO ehr.cage VALUES ('cif1380-0007', 'cif1380', '0007', '24', '26.1', '33', null, null, '1376');
INSERT INTO ehr.cage VALUES ('cif1380-0008', 'cif1380', '0008', '24', '26.1', '33', null, null, '1377');
INSERT INTO ehr.cage VALUES ('cif1381-0001', 'cif1381', '0001', '24', '26.1', '33', null, null, '1378');
INSERT INTO ehr.cage VALUES ('cif1381-0002', 'cif1381', '0002', '24', '26.1', '33', null, null, '1379');
INSERT INTO ehr.cage VALUES ('cif1381-0003', 'cif1381', '0003', '24', '26.1', '33', null, null, '1380');
INSERT INTO ehr.cage VALUES ('cif1381-0004', 'cif1381', '0004', '24', '26.1', '33', null, null, '1381');
INSERT INTO ehr.cage VALUES ('cif1381-0005', 'cif1381', '0005', '24', '26.1', '33', null, null, '1382');
INSERT INTO ehr.cage VALUES ('cif1381-0006', 'cif1381', '0006', '24', '26.1', '33', null, null, '1383');
INSERT INTO ehr.cage VALUES ('cif1381-0007', 'cif1381', '0007', '24', '26.1', '33', null, null, '1384');
INSERT INTO ehr.cage VALUES ('cif1381-0008', 'cif1381', '0008', '24', '26.1', '33', null, null, '1385');
INSERT INTO ehr.cage VALUES ('cif1382-0001', 'cif1382', '0001', '24', '26.1', '33', null, null, '1386');
INSERT INTO ehr.cage VALUES ('cif1382-0002', 'cif1382', '0002', '24', '26.1', '33', null, null, '1387');
INSERT INTO ehr.cage VALUES ('cif1382-0003', 'cif1382', '0003', '24', '26.1', '33', null, null, '1388');
INSERT INTO ehr.cage VALUES ('cif1382-0004', 'cif1382', '0004', '24', '26.1', '33', null, null, '1389');
INSERT INTO ehr.cage VALUES ('cif1382-0005', 'cif1382', '0005', '24', '26.1', '33', null, null, '1390');
INSERT INTO ehr.cage VALUES ('cif1382-0006', 'cif1382', '0006', '24', '26.1', '33', null, null, '1391');
INSERT INTO ehr.cage VALUES ('cif1382-0007', 'cif1382', '0007', '24', '26.1', '33', null, null, '1392');
INSERT INTO ehr.cage VALUES ('cif1382-0008', 'cif1382', '0008', '24', '26.1', '33', null, null, '1393');
INSERT INTO ehr.cage VALUES ('cif1383-0001', 'cif1383', '0001', '24', '26.1', '33', null, null, '1394');
INSERT INTO ehr.cage VALUES ('cif1383-0002', 'cif1383', '0002', '24', '26.1', '33', null, null, '1395');
INSERT INTO ehr.cage VALUES ('cif1383-0003', 'cif1383', '0003', '24', '26.1', '33', null, null, '1396');
INSERT INTO ehr.cage VALUES ('cif1383-0004', 'cif1383', '0004', '24', '26.1', '33', null, null, '1397');
INSERT INTO ehr.cage VALUES ('cif1383-0005', 'cif1383', '0005', '24', '26.1', '33', null, null, '1398');
INSERT INTO ehr.cage VALUES ('cif1383-0006', 'cif1383', '0006', '24', '26.1', '33', null, null, '1399');
INSERT INTO ehr.cage VALUES ('cif1383-0007', 'cif1383', '0007', '24', '26.1', '33', null, null, '1400');
INSERT INTO ehr.cage VALUES ('cif1383-0008', 'cif1383', '0008', '24', '26.1', '33', null, null, '1401');
INSERT INTO ehr.cage VALUES ('cif1384-0001', 'cif1384', '0001', '24', '26.1', '33', null, null, '1402');
INSERT INTO ehr.cage VALUES ('cif1384-0002', 'cif1384', '0002', '24', '26.1', '33', null, null, '1403');
INSERT INTO ehr.cage VALUES ('cif1384-0003', 'cif1384', '0003', '24', '26.1', '33', null, null, '1404');
INSERT INTO ehr.cage VALUES ('cif1384-0004', 'cif1384', '0004', '24', '26.1', '33', null, null, '1405');
INSERT INTO ehr.cage VALUES ('cif1384-0005', 'cif1384', '0005', '24', '26.1', '33', null, null, '1406');
INSERT INTO ehr.cage VALUES ('cif1384-0006', 'cif1384', '0006', '24', '26.1', '33', null, null, '1407');
INSERT INTO ehr.cage VALUES ('cif1384-0007', 'cif1384', '0007', '24', '26.1', '33', null, null, '1408');
INSERT INTO ehr.cage VALUES ('cif1384-0008', 'cif1384', '0008', '24', '26.1', '33', null, null, '1409');
INSERT INTO ehr.cage VALUES ('mr1520-0001', 'mr1520', '0001', '27', '34', '32', null, null, '1410');
INSERT INTO ehr.cage VALUES ('mr1520-0002', 'mr1520', '0002', '27', '34', '32', null, null, '1411');
INSERT INTO ehr.cage VALUES ('mr1520-0003', 'mr1520', '0003', '27', '34', '32', null, null, '1412');
INSERT INTO ehr.cage VALUES ('mr1520-0004', 'mr1520', '0004', '27', '34', '32', null, null, '1413');
INSERT INTO ehr.cage VALUES ('mr1520-0005', 'mr1520', '0005', '27', '34', '32', null, null, '1414');
INSERT INTO ehr.cage VALUES ('mr1520-0006', 'mr1520', '0006', '27', '34', '32', null, null, '1415');
INSERT INTO ehr.cage VALUES ('mr1520-0007', 'mr1520', '0007', '27', '34', '32', null, null, '1416');
INSERT INTO ehr.cage VALUES ('mr1520-0008', 'mr1520', '0008', '27', '34', '32', null, null, '1417');
INSERT INTO ehr.cage VALUES ('mr1520-0009', 'mr1520', '0009', '27', '34', '32', null, null, '1418');
INSERT INTO ehr.cage VALUES ('mr1520-0010', 'mr1520', '0010', '27', '34', '32', null, null, '1419');
INSERT INTO ehr.cage VALUES ('mr1520-0011', 'mr1520', '0011', '27', '34', '32', null, null, '1420');
INSERT INTO ehr.cage VALUES ('mr1520-0012', 'mr1520', '0012', '27', '34', '32', null, null, '1421');
INSERT INTO ehr.cage VALUES ('mr1520-0013', 'mr1520', '0013', '27', '34', '32', null, null, '1422');
INSERT INTO ehr.cage VALUES ('mr1520-0014', 'mr1520', '0014', '27', '34', '32', null, null, '1423');
INSERT INTO ehr.cage VALUES ('mr1520-0015', 'mr1520', '0015', '27', '34', '32', null, null, '1424');
INSERT INTO ehr.cage VALUES ('mr1520-0016', 'mr1520', '0016', '27', '34', '32', null, null, '1425');
INSERT INTO ehr.cage VALUES ('mr1520-0017', 'mr1520', '0017', '27', '34', '32', null, null, '1426');
INSERT INTO ehr.cage VALUES ('mr1520-0018', 'mr1520', '0018', '27', '34', '32', null, null, '1427');
INSERT INTO ehr.cage VALUES ('mr1520-0019', 'mr1520', '0019', '27', '34', '32', null, null, '1428');
INSERT INTO ehr.cage VALUES ('mr1520-0020', 'mr1520', '0020', '27', '34', '32', null, null, '1429');
INSERT INTO ehr.cage VALUES ('mr1522-0001', 'mr1522', '0001', '27', '34', '32', null, null, '1430');
INSERT INTO ehr.cage VALUES ('mr1522-0002', 'mr1522', '0002', '27', '34', '32', null, null, '1431');
INSERT INTO ehr.cage VALUES ('mr1522-0003', 'mr1522', '0003', '27', '34', '32', null, null, '1432');
INSERT INTO ehr.cage VALUES ('mr1522-0004', 'mr1522', '0004', '27', '34', '32', null, null, '1433');
INSERT INTO ehr.cage VALUES ('mr1522-0005', 'mr1522', '0005', '27', '34', '32', null, null, '1434');
INSERT INTO ehr.cage VALUES ('mr1522-0006', 'mr1522', '0006', '27', '34', '32', null, null, '1435');
INSERT INTO ehr.cage VALUES ('mr1522-0007', 'mr1522', '0007', '27', '34', '32', null, null, '1436');
INSERT INTO ehr.cage VALUES ('mr1522-0008', 'mr1522', '0008', '27', '34', '32', null, null, '1437');
INSERT INTO ehr.cage VALUES ('mr1522-0009', 'mr1522', '0009', '27', '34', '32', null, null, '1438');
INSERT INTO ehr.cage VALUES ('mr1522-0010', 'mr1522', '0010', '27', '34', '32', null, null, '1439');
INSERT INTO ehr.cage VALUES ('mr1522-0011', 'mr1522', '0011', '27', '34', '32', null, null, '1440');
INSERT INTO ehr.cage VALUES ('mr1522-0012', 'mr1522', '0012', '27', '34', '32', null, null, '1441');
INSERT INTO ehr.cage VALUES ('mr1522-0013', 'mr1522', '0013', '27', '34', '32', null, null, '1442');
INSERT INTO ehr.cage VALUES ('mr1522-0014', 'mr1522', '0014', '27', '34', '32', null, null, '1443');
INSERT INTO ehr.cage VALUES ('mr1522-0015', 'mr1522', '0015', '27', '34', '32', null, null, '1444');
INSERT INTO ehr.cage VALUES ('mr1522-0016', 'mr1522', '0016', '27', '34', '32', null, null, '1445');
INSERT INTO ehr.cage VALUES ('mr1522-0017', 'mr1522', '0017', '27', '34', '32', null, null, '1446');
INSERT INTO ehr.cage VALUES ('mr1522-0018', 'mr1522', '0018', '27', '34', '32', null, null, '1447');
INSERT INTO ehr.cage VALUES ('mr1522-0019', 'mr1522', '0019', '27', '34', '32', null, null, '1448');
INSERT INTO ehr.cage VALUES ('mr1522-0020', 'mr1522', '0020', '27', '34', '32', null, null, '1449');
INSERT INTO ehr.cage VALUES ('mr1522-0021', 'mr1522', '0021', '27', '34', '32', null, null, '1450');
INSERT INTO ehr.cage VALUES ('mr1522-0022', 'mr1522', '0022', '27', '34', '32', null, null, '1451');
INSERT INTO ehr.cage VALUES ('mr1522-0023', 'mr1522', '0023', '27', '34', '32', null, null, '1452');
INSERT INTO ehr.cage VALUES ('mr1522-0024', 'mr1522', '0024', '27', '34', '32', null, null, '1453');
INSERT INTO ehr.cage VALUES ('mr1523-0001', 'mr1523', '0001', '27', '34', '32', null, null, '1454');
INSERT INTO ehr.cage VALUES ('mr1523-0002', 'mr1523', '0002', '27', '34', '32', null, null, '1455');
INSERT INTO ehr.cage VALUES ('mr1523-0003', 'mr1523', '0003', '27', '34', '32', null, null, '1456');
INSERT INTO ehr.cage VALUES ('mr1523-0004', 'mr1523', '0004', '27', '34', '32', null, null, '1457');
INSERT INTO ehr.cage VALUES ('mr1523-0005', 'mr1523', '0005', '27', '34', '32', null, null, '1458');
INSERT INTO ehr.cage VALUES ('mr1523-0006', 'mr1523', '0006', '27', '34', '32', null, null, '1459');
INSERT INTO ehr.cage VALUES ('mr1523-0007', 'mr1523', '0007', '27', '34', '32', null, null, '1460');
INSERT INTO ehr.cage VALUES ('mr1523-0008', 'mr1523', '0008', '27', '34', '32', null, null, '1461');
INSERT INTO ehr.cage VALUES ('mr1523-0009', 'mr1523', '0009', '27', '34', '32', null, null, '1462');
INSERT INTO ehr.cage VALUES ('mr1523-0010', 'mr1523', '0010', '27', '34', '32', null, null, '1463');
INSERT INTO ehr.cage VALUES ('mr1523-0011', 'mr1523', '0011', '27', '34', '32', null, null, '1464');
INSERT INTO ehr.cage VALUES ('mr1523-0012', 'mr1523', '0012', '27', '34', '32', null, null, '1465');
INSERT INTO ehr.cage VALUES ('mr1523-0013', 'mr1523', '0013', '27', '34', '32', null, null, '1466');
INSERT INTO ehr.cage VALUES ('mr1523-0014', 'mr1523', '0014', '27', '34', '32', null, null, '1467');
INSERT INTO ehr.cage VALUES ('mr1523-0015', 'mr1523', '0015', '27', '34', '32', null, null, '1468');
INSERT INTO ehr.cage VALUES ('mr1523-0016', 'mr1523', '0016', '27', '34', '32', null, null, '1469');
INSERT INTO ehr.cage VALUES ('mr1523-0017', 'mr1523', '0017', '27', '34', '32', null, null, '1470');
INSERT INTO ehr.cage VALUES ('mr1523-0018', 'mr1523', '0018', '27', '34', '32', null, null, '1471');
INSERT INTO ehr.cage VALUES ('mr1523-0019', 'mr1523', '0019', '27', '34', '32', null, null, '1472');
INSERT INTO ehr.cage VALUES ('mr1523-0020', 'mr1523', '0020', '27', '34', '32', null, null, '1473');
INSERT INTO ehr.cage VALUES ('mr1523-0021', 'mr1523', '0021', '27', '34', '32', null, null, '1474');
INSERT INTO ehr.cage VALUES ('mr1523-0022', 'mr1523', '0022', '27', '34', '32', null, null, '1475');
INSERT INTO ehr.cage VALUES ('mr1523-0023', 'mr1523', '0023', '27', '34', '32', null, null, '1476');
INSERT INTO ehr.cage VALUES ('mr1523-0024', 'mr1523', '0024', '27', '34', '32', null, null, '1477');
INSERT INTO ehr.cage VALUES ('mr1523-0025', 'mr1523', '0025', '27', '34', '32', null, null, '1478');
INSERT INTO ehr.cage VALUES ('mr1523-0026', 'mr1523', '0026', '27', '34', '32', null, null, '1479');
INSERT INTO ehr.cage VALUES ('mr1523-0027', 'mr1523', '0027', '27', '34', '32', null, null, '1480');
INSERT INTO ehr.cage VALUES ('mr1523-0028', 'mr1523', '0028', '27', '34', '32', null, null, '1481');
INSERT INTO ehr.cage VALUES ('mr1523-0029', 'mr1523', '0029', '27', '34', '32', null, null, '1482');
INSERT INTO ehr.cage VALUES ('mr1523-0030', 'mr1523', '0030', '27', '34', '32', null, null, '1483');
INSERT INTO ehr.cage VALUES ('mr1523-0031', 'mr1523', '0031', '27', '34', '32', null, null, '1484');
INSERT INTO ehr.cage VALUES ('mr1523-0032', 'mr1523', '0032', '27', '34', '32', null, null, '1485');
INSERT INTO ehr.cage VALUES ('mr1523-0033', 'mr1523', '0033', '27', '34', '32', null, null, '1486');
INSERT INTO ehr.cage VALUES ('mr1523-0034', 'mr1523', '0034', '27', '34', '32', null, null, '1487');
INSERT INTO ehr.cage VALUES ('mr1523-0035', 'mr1523', '0035', '27', '34', '32', null, null, '1488');
INSERT INTO ehr.cage VALUES ('mr1523-0036', 'mr1523', '0036', '27', '34', '32', null, null, '1489');
INSERT INTO ehr.cage VALUES ('mr1526-0001', 'mr1526', '0001', '27', '34', '32', null, null, '1490');
INSERT INTO ehr.cage VALUES ('mr1526-0002', 'mr1526', '0002', '27', '34', '32', null, null, '1491');
INSERT INTO ehr.cage VALUES ('mr1526-0003', 'mr1526', '0003', '27', '34', '32', null, null, '1492');
INSERT INTO ehr.cage VALUES ('mr1526-0004', 'mr1526', '0004', '27', '34', '32', null, null, '1493');
INSERT INTO ehr.cage VALUES ('mr1526-0005', 'mr1526', '0005', '27', '34', '32', null, null, '1494');
INSERT INTO ehr.cage VALUES ('mr1526-0006', 'mr1526', '0006', '27', '34', '32', null, null, '1495');
INSERT INTO ehr.cage VALUES ('mr1526-0007', 'mr1526', '0007', '27', '34', '32', null, null, '1496');
INSERT INTO ehr.cage VALUES ('mr1526-0008', 'mr1526', '0008', '27', '34', '32', null, null, '1497');
INSERT INTO ehr.cage VALUES ('mr1526-0009', 'mr1526', '0009', '27', '34', '32', null, null, '1498');
INSERT INTO ehr.cage VALUES ('mr1526-0010', 'mr1526', '0010', '27', '34', '32', null, null, '1499');
INSERT INTO ehr.cage VALUES ('mr1526-0011', 'mr1526', '0011', '27', '34', '32', null, null, '1500');
INSERT INTO ehr.cage VALUES ('mr1526-0012', 'mr1526', '0012', '27', '34', '32', null, null, '1501');
INSERT INTO ehr.cage VALUES ('mr1526-0013', 'mr1526', '0013', '27', '34', '32', null, null, '1502');
INSERT INTO ehr.cage VALUES ('mr1526-0014', 'mr1526', '0014', '27', '34', '32', null, null, '1503');
INSERT INTO ehr.cage VALUES ('mr1526-0015', 'mr1526', '0015', '27', '34', '32', null, null, '1504');
INSERT INTO ehr.cage VALUES ('mr1526-0016', 'mr1526', '0016', '27', '34', '32', null, null, '1505');
INSERT INTO ehr.cage VALUES ('mr1526-0017', 'mr1526', '0017', '27', '34', '32', null, null, '1506');
INSERT INTO ehr.cage VALUES ('mr1526-0018', 'mr1526', '0018', '27', '34', '32', null, null, '1507');
INSERT INTO ehr.cage VALUES ('mr1526-0019', 'mr1526', '0019', '27', '34', '32', null, null, '1508');
INSERT INTO ehr.cage VALUES ('mr1526-0020', 'mr1526', '0020', '27', '34', '32', null, null, '1509');
INSERT INTO ehr.cage VALUES ('mr1526-0021', 'mr1526', '0021', '27', '34', '32', null, null, '1510');
INSERT INTO ehr.cage VALUES ('mr1526-0022', 'mr1526', '0022', '27', '34', '32', null, null, '1511');
INSERT INTO ehr.cage VALUES ('mr1526-0023', 'mr1526', '0023', '27', '34', '32', null, null, '1512');
INSERT INTO ehr.cage VALUES ('mr1526-0024', 'mr1526', '0024', '27', '34', '32', null, null, '1513');
INSERT INTO ehr.cage VALUES ('mr1527-0001', 'mr1527', '0001', '27', '34', '32', null, null, '1514');
INSERT INTO ehr.cage VALUES ('mr1527-0002', 'mr1527', '0002', '27', '34', '32', null, null, '1515');
INSERT INTO ehr.cage VALUES ('mr1527-0003', 'mr1527', '0003', '27', '34', '32', null, null, '1516');
INSERT INTO ehr.cage VALUES ('mr1527-0004', 'mr1527', '0004', '27', '34', '32', null, null, '1517');
INSERT INTO ehr.cage VALUES ('mr1527-0005', 'mr1527', '0005', '27', '34', '32', null, null, '1518');
INSERT INTO ehr.cage VALUES ('mr1527-0006', 'mr1527', '0006', '27', '34', '32', null, null, '1519');
INSERT INTO ehr.cage VALUES ('mr1527-0007', 'mr1527', '0007', '27', '34', '32', null, null, '1520');
INSERT INTO ehr.cage VALUES ('mr1527-0008', 'mr1527', '0008', '27', '34', '32', null, null, '1521');
INSERT INTO ehr.cage VALUES ('mr1527-0009', 'mr1527', '0009', '27', '34', '32', null, null, '1522');
INSERT INTO ehr.cage VALUES ('mr1527-0010', 'mr1527', '0010', '27', '34', '32', null, null, '1523');
INSERT INTO ehr.cage VALUES ('mr1527-0011', 'mr1527', '0011', '27', '34', '32', null, null, '1524');
INSERT INTO ehr.cage VALUES ('mr1527-0012', 'mr1527', '0012', '27', '34', '32', null, null, '1525');
INSERT INTO ehr.cage VALUES ('mr1527-0013', 'mr1527', '0013', '27', '34', '32', null, null, '1526');
INSERT INTO ehr.cage VALUES ('mr1527-0014', 'mr1527', '0014', '27', '34', '32', null, null, '1527');
INSERT INTO ehr.cage VALUES ('mr1527-0015', 'mr1527', '0015', '27', '34', '32', null, null, '1528');
INSERT INTO ehr.cage VALUES ('mr1527-0016', 'mr1527', '0016', '27', '34', '32', null, null, '1529');
INSERT INTO ehr.cage VALUES ('mr1527-0017', 'mr1527', '0017', '27', '34', '32', null, null, '1530');
INSERT INTO ehr.cage VALUES ('mr1527-0018', 'mr1527', '0018', '27', '34', '32', null, null, '1531');
INSERT INTO ehr.cage VALUES ('mr1527-0019', 'mr1527', '0019', '27', '34', '32', null, null, '1532');
INSERT INTO ehr.cage VALUES ('mr1527-0020', 'mr1527', '0020', '27', '34', '32', null, null, '1533');
INSERT INTO ehr.cage VALUES ('mr1527-0021', 'mr1527', '0021', '27', '34', '32', null, null, '1534');
INSERT INTO ehr.cage VALUES ('mr1527-0022', 'mr1527', '0022', '27', '34', '32', null, null, '1535');
INSERT INTO ehr.cage VALUES ('mr1527-0023', 'mr1527', '0023', '27', '34', '32', null, null, '1536');
INSERT INTO ehr.cage VALUES ('mr1527-0024', 'mr1527', '0024', '27', '34', '32', null, null, '1537');
INSERT INTO ehr.cage VALUES ('mr1527-0025', 'mr1527', '0025', '27', '34', '32', null, null, '1538');
INSERT INTO ehr.cage VALUES ('mr1527-0026', 'mr1527', '0026', '27', '34', '32', null, null, '1539');
INSERT INTO ehr.cage VALUES ('mr1527-0027', 'mr1527', '0027', '27', '34', '32', null, null, '1540');
INSERT INTO ehr.cage VALUES ('mr1527-0028', 'mr1527', '0028', '27', '34', '32', null, null, '1541');
INSERT INTO ehr.cage VALUES ('mr1527-0029', 'mr1527', '0029', '27', '34', '32', null, null, '1542');
INSERT INTO ehr.cage VALUES ('mr1527-0030', 'mr1527', '0030', '27', '34', '32', null, null, '1543');
INSERT INTO ehr.cage VALUES ('mr1527-0031', 'mr1527', '0031', '27', '34', '32', null, null, '1544');
INSERT INTO ehr.cage VALUES ('mr1527-0032', 'mr1527', '0032', '27', '34', '32', null, null, '1545');
INSERT INTO ehr.cage VALUES ('mr1527-0033', 'mr1527', '0033', '27', '34', '32', null, null, '1546');
INSERT INTO ehr.cage VALUES ('mr1527-0034', 'mr1527', '0034', '27', '34', '32', null, null, '1547');
INSERT INTO ehr.cage VALUES ('mr1527-0035', 'mr1527', '0035', '27', '34', '32', null, null, '1548');
INSERT INTO ehr.cage VALUES ('mr1527-0036', 'mr1527', '0036', '27', '34', '32', null, null, '1549');
INSERT INTO ehr.cage VALUES ('mr1535-0001', 'mr1535', '0001', '27', '34', '32', null, null, '1550');
INSERT INTO ehr.cage VALUES ('mr1535-0002', 'mr1535', '0002', '27', '34', '32', null, null, '1551');
INSERT INTO ehr.cage VALUES ('mr1535-0003', 'mr1535', '0003', '27', '34', '32', null, null, '1552');
INSERT INTO ehr.cage VALUES ('mr1535-0004', 'mr1535', '0004', '27', '34', '32', null, null, '1553');
INSERT INTO ehr.cage VALUES ('mr1535-0005', 'mr1535', '0005', '27', '34', '32', null, null, '1554');
INSERT INTO ehr.cage VALUES ('mr1535-0006', 'mr1535', '0006', '27', '34', '32', null, null, '1555');
INSERT INTO ehr.cage VALUES ('mr1535-0007', 'mr1535', '0007', '27', '34', '32', null, null, '1556');
INSERT INTO ehr.cage VALUES ('mr1535-0008', 'mr1535', '0008', '27', '34', '32', null, null, '1557');
INSERT INTO ehr.cage VALUES ('mr1535-0009', 'mr1535', '0009', '27', '34', '32', null, null, '1558');
INSERT INTO ehr.cage VALUES ('mr1535-0010', 'mr1535', '0010', '27', '34', '32', null, null, '1559');
INSERT INTO ehr.cage VALUES ('mr1535-0011', 'mr1535', '0011', '27', '34', '32', null, null, '1560');
INSERT INTO ehr.cage VALUES ('mr1535-0012', 'mr1535', '0012', '27', '34', '32', null, null, '1561');
INSERT INTO ehr.cage VALUES ('mr1535-0013', 'mr1535', '0013', '27', '34', '32', null, null, '1562');
INSERT INTO ehr.cage VALUES ('mr1535-0014', 'mr1535', '0014', '27', '34', '32', null, null, '1563');
INSERT INTO ehr.cage VALUES ('mr1535-0015', 'mr1535', '0015', '27', '34', '32', null, null, '1564');
INSERT INTO ehr.cage VALUES ('mr1535-0016', 'mr1535', '0016', '27', '34', '32', null, null, '1565');
INSERT INTO ehr.cage VALUES ('mr1535-0017', 'mr1535', '0017', '27', '34', '32', null, null, '1566');
INSERT INTO ehr.cage VALUES ('mr1535-0018', 'mr1535', '0018', '27', '34', '32', null, null, '1567');
INSERT INTO ehr.cage VALUES ('mr1535-0019', 'mr1535', '0019', '27', '34', '32', null, null, '1568');
INSERT INTO ehr.cage VALUES ('mr1535-0020', 'mr1535', '0020', '27', '34', '32', null, null, '1569');
INSERT INTO ehr.cage VALUES ('mr1535-0021', 'mr1535', '0021', '27', '34', '32', null, null, '1570');
INSERT INTO ehr.cage VALUES ('mr1535-0022', 'mr1535', '0022', '27', '34', '32', null, null, '1571');
INSERT INTO ehr.cage VALUES ('mr1535-0023', 'mr1535', '0023', '27', '34', '32', null, null, '1572');
INSERT INTO ehr.cage VALUES ('mr1535-0024', 'mr1535', '0024', '27', '34', '32', null, null, '1573');
INSERT INTO ehr.cage VALUES ('mr1537-0001', 'mr1537', '0001', '27', '34', '32', null, null, '1574');
INSERT INTO ehr.cage VALUES ('mr1537-0002', 'mr1537', '0002', '27', '34', '32', null, null, '1575');
INSERT INTO ehr.cage VALUES ('mr1537-0003', 'mr1537', '0003', '27', '34', '32', null, null, '1576');
INSERT INTO ehr.cage VALUES ('mr1537-0004', 'mr1537', '0004', '27', '34', '32', null, null, '1577');
INSERT INTO ehr.cage VALUES ('mr1537-0005', 'mr1537', '0005', '27', '34', '32', null, null, '1578');
INSERT INTO ehr.cage VALUES ('mr1537-0006', 'mr1537', '0006', '27', '34', '32', null, null, '1579');
INSERT INTO ehr.cage VALUES ('mr1537-0007', 'mr1537', '0007', '27', '34', '32', null, null, '1580');
INSERT INTO ehr.cage VALUES ('mr1537-0008', 'mr1537', '0008', '27', '34', '32', null, null, '1581');
INSERT INTO ehr.cage VALUES ('mr1537-0009', 'mr1537', '0009', '27', '34', '32', null, null, '1582');
INSERT INTO ehr.cage VALUES ('mr1537-0010', 'mr1537', '0010', '27', '34', '32', null, null, '1583');
INSERT INTO ehr.cage VALUES ('mr1537-0011', 'mr1537', '0011', '27', '34', '32', null, null, '1584');
INSERT INTO ehr.cage VALUES ('mr1537-0012', 'mr1537', '0012', '27', '34', '32', null, null, '1585');
INSERT INTO ehr.cage VALUES ('mr1537-0013', 'mr1537', '0013', '27', '34', '32', null, null, '1586');
INSERT INTO ehr.cage VALUES ('mr1537-0014', 'mr1537', '0014', '27', '34', '32', null, null, '1587');
INSERT INTO ehr.cage VALUES ('mr1537-0015', 'mr1537', '0015', '27', '34', '32', null, null, '1588');
INSERT INTO ehr.cage VALUES ('mr1537-0016', 'mr1537', '0016', '27', '34', '32', null, null, '1589');
INSERT INTO ehr.cage VALUES ('mr1537-0017', 'mr1537', '0017', '27', '34', '32', null, null, '1590');
INSERT INTO ehr.cage VALUES ('mr1537-0018', 'mr1537', '0018', '27', '34', '32', null, null, '1591');
INSERT INTO ehr.cage VALUES ('mr1537-0019', 'mr1537', '0019', '27', '34', '32', null, null, '1592');
INSERT INTO ehr.cage VALUES ('mr1537-0020', 'mr1537', '0020', '27', '34', '32', null, null, '1593');
INSERT INTO ehr.cage VALUES ('mr1551-0001', 'mr1551', '0001', '27', '34', '32', null, null, '1594');
INSERT INTO ehr.cage VALUES ('mr1551-0002', 'mr1551', '0002', '27', '34', '32', null, null, '1595');
INSERT INTO ehr.cage VALUES ('mr1551-0003', 'mr1551', '0003', '27', '34', '32', null, null, '1596');
INSERT INTO ehr.cage VALUES ('mr1551-0004', 'mr1551', '0004', '27', '34', '32', null, null, '1597');
INSERT INTO ehr.cage VALUES ('mr1551-0005', 'mr1551', '0005', '27', '34', '32', null, null, '1598');
INSERT INTO ehr.cage VALUES ('mr1551-0006', 'mr1551', '0006', '27', '34', '32', null, null, '1599');
INSERT INTO ehr.cage VALUES ('mr1551-0007', 'mr1551', '0007', '27', '34', '32', null, null, '1600');
INSERT INTO ehr.cage VALUES ('mr1551-0008', 'mr1551', '0008', '27', '34', '32', null, null, '1601');
INSERT INTO ehr.cage VALUES ('mr1551-0009', 'mr1551', '0009', '27', '34', '32', null, null, '1602');
INSERT INTO ehr.cage VALUES ('mr1551-0010', 'mr1551', '0010', '27', '34', '32', null, null, '1603');
INSERT INTO ehr.cage VALUES ('mr1551-0011', 'mr1551', '0011', '27', '34', '32', null, null, '1604');
INSERT INTO ehr.cage VALUES ('mr1551-0012', 'mr1551', '0012', '27', '34', '32', null, null, '1605');
INSERT INTO ehr.cage VALUES ('mr1551-0013', 'mr1551', '0013', '27', '34', '32', null, null, '1606');
INSERT INTO ehr.cage VALUES ('mr1551-0014', 'mr1551', '0014', '27', '34', '32', null, null, '1607');
INSERT INTO ehr.cage VALUES ('mr1551-0015', 'mr1551', '0015', '27', '34', '32', null, null, '1608');
INSERT INTO ehr.cage VALUES ('mr1551-0016', 'mr1551', '0016', '27', '34', '32', null, null, '1609');
INSERT INTO ehr.cage VALUES ('mr1551-0017', 'mr1551', '0017', '27', '34', '32', null, null, '1610');
INSERT INTO ehr.cage VALUES ('mr1551-0018', 'mr1551', '0018', '27', '34', '32', null, null, '1611');
INSERT INTO ehr.cage VALUES ('mr1551-0019', 'mr1551', '0019', '27', '34', '32', null, null, '1612');
INSERT INTO ehr.cage VALUES ('mr1551-0020', 'mr1551', '0020', '27', '34', '32', null, null, '1613');
INSERT INTO ehr.cage VALUES ('mr1552-0001', 'mr1552', '0001', '27', '34', '32', null, null, '1614');
INSERT INTO ehr.cage VALUES ('mr1552-0002', 'mr1552', '0002', '27', '34', '32', null, null, '1615');
INSERT INTO ehr.cage VALUES ('mr1552-0003', 'mr1552', '0003', '27', '34', '32', null, null, '1616');
INSERT INTO ehr.cage VALUES ('mr1552-0004', 'mr1552', '0004', '27', '34', '32', null, null, '1617');
INSERT INTO ehr.cage VALUES ('mr1552-0005', 'mr1552', '0005', '27', '34', '32', null, null, '1618');
INSERT INTO ehr.cage VALUES ('mr1552-0006', 'mr1552', '0006', '27', '34', '32', null, null, '1619');
INSERT INTO ehr.cage VALUES ('mr1552-0007', 'mr1552', '0007', '27', '34', '32', null, null, '1620');
INSERT INTO ehr.cage VALUES ('mr1552-0008', 'mr1552', '0008', '27', '34', '32', null, null, '1621');
INSERT INTO ehr.cage VALUES ('mr1552-0009', 'mr1552', '0009', '27', '34', '32', null, null, '1622');
INSERT INTO ehr.cage VALUES ('mr1552-0010', 'mr1552', '0010', '27', '34', '32', null, null, '1623');
INSERT INTO ehr.cage VALUES ('mr1552-0011', 'mr1552', '0011', '27', '34', '32', null, null, '1624');
INSERT INTO ehr.cage VALUES ('mr1552-0012', 'mr1552', '0012', '27', '34', '32', null, null, '1625');
INSERT INTO ehr.cage VALUES ('mr1552-0013', 'mr1552', '0013', '27', '34', '32', null, null, '1626');
INSERT INTO ehr.cage VALUES ('mr1552-0014', 'mr1552', '0014', '27', '34', '32', null, null, '1627');
INSERT INTO ehr.cage VALUES ('mr1552-0015', 'mr1552', '0015', '27', '34', '32', null, null, '1628');
INSERT INTO ehr.cage VALUES ('mr1552-0016', 'mr1552', '0016', '27', '34', '32', null, null, '1629');
INSERT INTO ehr.cage VALUES ('mr1552-0017', 'mr1552', '0017', '27', '34', '32', null, null, '1630');
INSERT INTO ehr.cage VALUES ('mr1552-0018', 'mr1552', '0018', '27', '34', '32', null, null, '1631');
INSERT INTO ehr.cage VALUES ('mr1552-0019', 'mr1552', '0019', '27', '34', '32', null, null, '1632');
INSERT INTO ehr.cage VALUES ('mr1552-0020', 'mr1552', '0020', '27', '34', '32', null, null, '1633');
INSERT INTO ehr.cage VALUES ('mr1552-0021', 'mr1552', '0021', '27', '34', '32', null, null, '1634');
INSERT INTO ehr.cage VALUES ('mr1552-0022', 'mr1552', '0022', '27', '34', '32', null, null, '1635');
INSERT INTO ehr.cage VALUES ('mr1552-0023', 'mr1552', '0023', '27', '34', '32', null, null, '1636');
INSERT INTO ehr.cage VALUES ('mr1552-0024', 'mr1552', '0024', '27', '34', '32', null, null, '1637');
INSERT INTO ehr.cage VALUES ('mr1552-0025', 'mr1552', '0025', '27', '34', '32', null, null, '1638');
INSERT INTO ehr.cage VALUES ('mr1552-0026', 'mr1552', '0026', '27', '34', '32', null, null, '1639');
INSERT INTO ehr.cage VALUES ('mr1552-0027', 'mr1552', '0027', '27', '34', '32', null, null, '1640');
INSERT INTO ehr.cage VALUES ('mr1552-0028', 'mr1552', '0028', '27', '34', '32', null, null, '1641');
INSERT INTO ehr.cage VALUES ('mr1552-0029', 'mr1552', '0029', '27', '34', '32', null, null, '1642');
INSERT INTO ehr.cage VALUES ('mr1552-0030', 'mr1552', '0030', '27', '34', '32', null, null, '1643');
INSERT INTO ehr.cage VALUES ('mr1552-0031', 'mr1552', '0031', '27', '34', '32', null, null, '1644');
INSERT INTO ehr.cage VALUES ('mr1552-0032', 'mr1552', '0032', '27', '34', '32', null, null, '1645');
INSERT INTO ehr.cage VALUES ('mr1553-0001', 'mr1553', '0001', '27', '34', '32', null, null, '1646');
INSERT INTO ehr.cage VALUES ('mr1553-0002', 'mr1553', '0002', '27', '34', '32', null, null, '1647');
INSERT INTO ehr.cage VALUES ('mr1553-0003', 'mr1553', '0003', '27', '34', '32', null, null, '1648');
INSERT INTO ehr.cage VALUES ('mr1553-0004', 'mr1553', '0004', '27', '34', '32', null, null, '1649');
INSERT INTO ehr.cage VALUES ('mr1553-0005', 'mr1553', '0005', '27', '34', '32', null, null, '1650');
INSERT INTO ehr.cage VALUES ('mr1553-0006', 'mr1553', '0006', '27', '34', '32', null, null, '1651');
INSERT INTO ehr.cage VALUES ('mr1553-0007', 'mr1553', '0007', '27', '34', '32', null, null, '1652');
INSERT INTO ehr.cage VALUES ('mr1553-0008', 'mr1553', '0008', '27', '34', '32', null, null, '1653');
INSERT INTO ehr.cage VALUES ('mr1553-0009', 'mr1553', '0009', '27', '34', '32', null, null, '1654');
INSERT INTO ehr.cage VALUES ('mr1553-0010', 'mr1553', '0010', '27', '34', '32', null, null, '1655');
INSERT INTO ehr.cage VALUES ('mr1553-0011', 'mr1553', '0011', '27', '34', '32', null, null, '1656');
INSERT INTO ehr.cage VALUES ('mr1553-0012', 'mr1553', '0012', '27', '34', '32', null, null, '1657');
INSERT INTO ehr.cage VALUES ('mr1553-0013', 'mr1553', '0013', '27', '34', '32', null, null, '1658');
INSERT INTO ehr.cage VALUES ('mr1553-0014', 'mr1553', '0014', '27', '34', '32', null, null, '1659');
INSERT INTO ehr.cage VALUES ('mr1553-0015', 'mr1553', '0015', '27', '34', '32', null, null, '1660');
INSERT INTO ehr.cage VALUES ('mr1553-0016', 'mr1553', '0016', '27', '34', '32', null, null, '1661');
INSERT INTO ehr.cage VALUES ('mr1553-0017', 'mr1553', '0017', '27', '34', '32', null, null, '1662');
INSERT INTO ehr.cage VALUES ('mr1553-0018', 'mr1553', '0018', '27', '34', '32', null, null, '1663');
INSERT INTO ehr.cage VALUES ('mr1553-0019', 'mr1553', '0019', '27', '34', '32', null, null, '1664');
INSERT INTO ehr.cage VALUES ('mr1553-0020', 'mr1553', '0020', '27', '34', '32', null, null, '1665');
INSERT INTO ehr.cage VALUES ('mr1553-0021', 'mr1553', '0021', '27', '34', '32', null, null, '1666');
INSERT INTO ehr.cage VALUES ('mr1553-0022', 'mr1553', '0022', '27', '34', '32', null, null, '1667');
INSERT INTO ehr.cage VALUES ('mr1553-0023', 'mr1553', '0023', '27', '34', '32', null, null, '1668');
INSERT INTO ehr.cage VALUES ('mr1553-0024', 'mr1553', '0024', '27', '34', '32', null, null, '1669');
INSERT INTO ehr.cage VALUES ('mr1556-0001', 'mr1556', '0001', '27', '34', '32', null, null, '1670');
INSERT INTO ehr.cage VALUES ('mr1556-0002', 'mr1556', '0002', '27', '34', '32', null, null, '1671');
INSERT INTO ehr.cage VALUES ('mr1556-0003', 'mr1556', '0003', '27', '34', '32', null, null, '1672');
INSERT INTO ehr.cage VALUES ('mr1556-0004', 'mr1556', '0004', '27', '34', '32', null, null, '1673');
INSERT INTO ehr.cage VALUES ('mr1556-0005', 'mr1556', '0005', '27', '34', '32', null, null, '1674');
INSERT INTO ehr.cage VALUES ('mr1556-0006', 'mr1556', '0006', '27', '34', '32', null, null, '1675');
INSERT INTO ehr.cage VALUES ('mr1556-0007', 'mr1556', '0007', '27', '34', '32', null, null, '1676');
INSERT INTO ehr.cage VALUES ('mr1556-0008', 'mr1556', '0008', '27', '34', '32', null, null, '1677');
INSERT INTO ehr.cage VALUES ('mr1556-0009', 'mr1556', '0009', '27', '34', '32', null, null, '1678');
INSERT INTO ehr.cage VALUES ('mr1556-0010', 'mr1556', '0010', '27', '34', '32', null, null, '1679');
INSERT INTO ehr.cage VALUES ('mr1556-0011', 'mr1556', '0011', '27', '34', '32', null, null, '1680');
INSERT INTO ehr.cage VALUES ('mr1556-0012', 'mr1556', '0012', '27', '34', '32', null, null, '1681');
INSERT INTO ehr.cage VALUES ('mr1556-0013', 'mr1556', '0013', '27', '34', '32', null, null, '1682');
INSERT INTO ehr.cage VALUES ('mr1556-0014', 'mr1556', '0014', '27', '34', '32', null, null, '1683');
INSERT INTO ehr.cage VALUES ('mr1556-0015', 'mr1556', '0015', '27', '34', '32', null, null, '1684');
INSERT INTO ehr.cage VALUES ('mr1556-0016', 'mr1556', '0016', '27', '34', '32', null, null, '1685');
INSERT INTO ehr.cage VALUES ('mr1556-0017', 'mr1556', '0017', '27', '34', '32', null, null, '1686');
INSERT INTO ehr.cage VALUES ('mr1556-0018', 'mr1556', '0018', '27', '34', '32', null, null, '1687');
INSERT INTO ehr.cage VALUES ('mr1556-0019', 'mr1556', '0019', '27', '34', '32', null, null, '1688');
INSERT INTO ehr.cage VALUES ('mr1556-0020', 'mr1556', '0020', '27', '34', '32', null, null, '1689');
INSERT INTO ehr.cage VALUES ('mr1556-0021', 'mr1556', '0021', '27', '34', '32', null, null, '1690');
INSERT INTO ehr.cage VALUES ('mr1556-0022', 'mr1556', '0022', '27', '34', '32', null, null, '1691');
INSERT INTO ehr.cage VALUES ('mr1556-0023', 'mr1556', '0023', '27', '34', '32', null, null, '1692');
INSERT INTO ehr.cage VALUES ('mr1556-0024', 'mr1556', '0024', '27', '34', '32', null, null, '1693');
INSERT INTO ehr.cage VALUES ('mr1556-0025', 'mr1556', '0025', '27', '34', '32', null, null, '1694');
INSERT INTO ehr.cage VALUES ('mr1556-0026', 'mr1556', '0026', '27', '34', '32', null, null, '1695');
INSERT INTO ehr.cage VALUES ('mr1556-0027', 'mr1556', '0027', '27', '34', '32', null, null, '1696');
INSERT INTO ehr.cage VALUES ('mr1556-0028', 'mr1556', '0028', '27', '34', '32', null, null, '1697');
INSERT INTO ehr.cage VALUES ('mr1556-0029', 'mr1556', '0029', '27', '34', '32', null, null, '1698');
INSERT INTO ehr.cage VALUES ('mr1556-0030', 'mr1556', '0030', '27', '34', '32', null, null, '1699');
INSERT INTO ehr.cage VALUES ('mr1556-0031', 'mr1556', '0031', '27', '34', '32', null, null, '1700');
INSERT INTO ehr.cage VALUES ('mr1556-0032', 'mr1556', '0032', '27', '34', '32', null, null, '1701');
INSERT INTO ehr.cage VALUES ('mr1557-0001', 'mr1557', '0001', '27', '34', '32', null, null, '1702');
INSERT INTO ehr.cage VALUES ('mr1557-0002', 'mr1557', '0002', '27', '34', '32', null, null, '1703');
INSERT INTO ehr.cage VALUES ('mr1557-0003', 'mr1557', '0003', '27', '34', '32', null, null, '1704');
INSERT INTO ehr.cage VALUES ('mr1557-0004', 'mr1557', '0004', '27', '34', '32', null, null, '1705');
INSERT INTO ehr.cage VALUES ('mr1557-0005', 'mr1557', '0005', '27', '34', '32', null, null, '1706');
INSERT INTO ehr.cage VALUES ('mr1557-0006', 'mr1557', '0006', '27', '34', '32', null, null, '1707');
INSERT INTO ehr.cage VALUES ('mr1557-0007', 'mr1557', '0007', '27', '34', '32', null, null, '1708');
INSERT INTO ehr.cage VALUES ('mr1557-0008', 'mr1557', '0008', '27', '34', '32', null, null, '1709');
INSERT INTO ehr.cage VALUES ('mr1557-0009', 'mr1557', '0009', '27', '34', '32', null, null, '1710');
INSERT INTO ehr.cage VALUES ('mr1557-0010', 'mr1557', '0010', '27', '34', '32', null, null, '1711');
INSERT INTO ehr.cage VALUES ('mr1557-0011', 'mr1557', '0011', '27', '34', '32', null, null, '1712');
INSERT INTO ehr.cage VALUES ('mr1557-0012', 'mr1557', '0012', '27', '34', '32', null, null, '1713');
INSERT INTO ehr.cage VALUES ('mr1557-0013', 'mr1557', '0013', '27', '34', '32', null, null, '1714');
INSERT INTO ehr.cage VALUES ('mr1557-0014', 'mr1557', '0014', '27', '34', '32', null, null, '1715');
INSERT INTO ehr.cage VALUES ('mr1557-0015', 'mr1557', '0015', '27', '34', '32', null, null, '1716');
INSERT INTO ehr.cage VALUES ('mr1557-0016', 'mr1557', '0016', '27', '34', '32', null, null, '1717');
INSERT INTO ehr.cage VALUES ('mr1557-0017', 'mr1557', '0017', '27', '34', '32', null, null, '1718');
INSERT INTO ehr.cage VALUES ('mr1557-0018', 'mr1557', '0018', '27', '34', '32', null, null, '1719');
INSERT INTO ehr.cage VALUES ('mr1557-0019', 'mr1557', '0019', '27', '34', '32', null, null, '1720');
INSERT INTO ehr.cage VALUES ('mr1557-0020', 'mr1557', '0020', '27', '34', '32', null, null, '1721');


-- ----------------------------
-- Table structure for ehr.cageclass
-- ----------------------------
DROP TABLE IF EXISTS ehr.cageclass;
CREATE TABLE ehr.cageclass (
RowId SERIAL PRIMARY KEY,
low float8 DEFAULT NULL,
high float8 DEFAULT NULL,
sqft float8 DEFAULT NULL,
height float8 DEFAULT NULL
)
WITH (OIDS=FALSE)

;


-- ----------------------------
-- Records of cageclass
-- ----------------------------
INSERT INTO ehr.cageclass VALUES ('1', '0', '1', '1.6', '20');
INSERT INTO ehr.cageclass VALUES ('2', '1', '3', '3', '30');
INSERT INTO ehr.cageclass VALUES ('3', '3', '10', '4.3', '30');
INSERT INTO ehr.cageclass VALUES ('4', '10', '15', '6', '32');
INSERT INTO ehr.cageclass VALUES ('5', '15', '25', '8', '36');



-- ----------------------------
-- Table structure for clinpath_status
-- ----------------------------
DROP TABLE IF EXISTS ehr.clinpath_status;
CREATE TABLE ehr.clinpath_status (
status varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of clinpath_status
-- ----------------------------

-- ----------------------------
-- Table structure for clinremarks_category
-- ----------------------------
DROP TABLE IF EXISTS ehr.clinremarks_category;
CREATE TABLE ehr.clinremarks_category (
category varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of clinremarks_category
-- ----------------------------
INSERT INTO ehr.clinremarks_category VALUES ('Clinical');
INSERT INTO ehr.clinremarks_category VALUES ('Surgery');
INSERT INTO ehr.clinremarks_category VALUES ('Necropsy');
INSERT INTO ehr.clinremarks_category VALUES ('Biopsy');



-- ----------------------------
-- Table structure for ehr.condition_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.condition_codes;
CREATE TABLE ehr.condition_codes (
Code varchar(255) PRIMARY KEY,
Meaning varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of condition_codes
-- ----------------------------
INSERT INTO ehr.condition_codes VALUES ('am', 'with adopted mother');
INSERT INTO ehr.condition_codes VALUES ('b', 'breeding');
INSERT INTO ehr.condition_codes VALUES ('c', 'chair');
INSERT INTO ehr.condition_codes VALUES ('f', 'with the father');
INSERT INTO ehr.condition_codes VALUES ('g', 'in a group (+3 animals living together)');
INSERT INTO ehr.condition_codes VALUES ('gam', 'in a group with adopted mother');
INSERT INTO ehr.condition_codes VALUES ('gf', 'in a group with father');
INSERT INTO ehr.condition_codes VALUES ('gm', 'in a group with the mother');
INSERT INTO ehr.condition_codes VALUES ('gmf', 'in a group with the mother and father');
INSERT INTO ehr.condition_codes VALUES ('m', 'with the mother');
INSERT INTO ehr.condition_codes VALUES ('p', 'paired');
INSERT INTO ehr.condition_codes VALUES ('pc', 'protected contact paired');
INSERT INTO ehr.condition_codes VALUES ('s', 'single');
INSERT INTO ehr.condition_codes VALUES ('x', 'special housing condition');

-- ----------------------------
-- Table structure for ehr.death_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.death_codes;
CREATE TABLE ehr.death_codes (
Code varchar(255) PRIMARY KEY,
Meaning varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of death_codes
-- ----------------------------
INSERT INTO ehr.death_codes VALUES ('d-expr', 'Death - Experiment');
INSERT INTO ehr.death_codes VALUES ('d-othr', 'Death - Other');
INSERT INTO ehr.death_codes VALUES ('d-qc', 'Death - QC');
INSERT INTO ehr.death_codes VALUES ('d-quar', 'Death - Quarantine');
INSERT INTO ehr.death_codes VALUES ('d-qx', 'Death - QX');


-- ----------------------------
-- Table structure for dental_gingivitis
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_gingivitis;
CREATE TABLE ehr.dental_gingivitis (
result varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;



-- ----------------------------
-- Records of dental_gingivitis
-- ----------------------------
INSERT INTO ehr.dental_gingivitis VALUES ('No');
INSERT INTO ehr.dental_gingivitis VALUES ('Mild');
INSERT INTO ehr.dental_gingivitis VALUES ('Moderate');
INSERT INTO ehr.dental_gingivitis VALUES ('Severe');

-- ----------------------------
-- Table structure for dental_jaw
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_jaw;
CREATE TABLE ehr.dental_jaw (
jaw varchar(255) PRIMARY KEY   NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dental_jaw
-- ----------------------------
INSERT INTO ehr.dental_jaw VALUES ('Upper');
INSERT INTO ehr.dental_jaw VALUES ('Lower');

-- ----------------------------
-- Table structure for dental_priority
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_priority;
CREATE TABLE ehr.dental_priority (
priority varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dental_priority
-- ----------------------------
INSERT INTO ehr.dental_priority VALUES ('L');
INSERT INTO ehr.dental_priority VALUES ('L/M');
INSERT INTO ehr.dental_priority VALUES ('M');
INSERT INTO ehr.dental_priority VALUES ('M/H');
INSERT INTO ehr.dental_priority VALUES ('H');

-- ----------------------------
-- Table structure for dental_side
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_side;
CREATE TABLE ehr.dental_side (
side varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dental_side
-- ----------------------------
INSERT INTO ehr.dental_side VALUES ('Left');
INSERT INTO ehr.dental_side VALUES ('Right');

-- ----------------------------
-- Table structure for dental_status
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_status;
CREATE TABLE ehr.dental_status (
status varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dental_status
-- ----------------------------
INSERT INTO ehr.dental_status VALUES ('Fractured');
INSERT INTO ehr.dental_status VALUES ('Loose');
INSERT INTO ehr.dental_status VALUES ('Discolored');
INSERT INTO ehr.dental_status VALUES ('Missing');
INSERT INTO ehr.dental_status VALUES ('Needs Extraction');

-- ----------------------------
-- Table structure for dental_tartar
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_tartar;
CREATE TABLE ehr.dental_tartar (
result varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dental_tartar
-- ----------------------------
INSERT INTO ehr.dental_tartar VALUES ('None');
INSERT INTO ehr.dental_tartar VALUES ('Mild');
INSERT INTO ehr.dental_tartar VALUES ('Moderate');
INSERT INTO ehr.dental_tartar VALUES ('Severe');

-- ----------------------------
-- Table structure for dental_teeth
-- ----------------------------
DROP TABLE IF EXISTS ehr.dental_teeth;
CREATE TABLE ehr.dental_teeth (
teeth varchar PRIMARY KEY,
seq_order int4 DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dental_teeth
-- ----------------------------
INSERT INTO ehr.dental_teeth VALUES ('M3', '1');
INSERT INTO ehr.dental_teeth VALUES ('M2', '2');
INSERT INTO ehr.dental_teeth VALUES ('M1', '3');
INSERT INTO ehr.dental_teeth VALUES ('PM2', '4');
INSERT INTO ehr.dental_teeth VALUES ('PM1', '5');
INSERT INTO ehr.dental_teeth VALUES ('K9', '6');
INSERT INTO ehr.dental_teeth VALUES ('I2', '7');
INSERT INTO ehr.dental_teeth VALUES ('I1', '8');


-- ----------------------------
-- Table structure for ehr.dosage_units
-- ----------------------------
DROP TABLE IF EXISTS ehr.dosage_units;
CREATE TABLE ehr.dosage_units (
unit varchar(100) PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of dosage_units
-- ----------------------------
INSERT INTO ehr.dosage_units VALUES ('g');
INSERT INTO ehr.dosage_units VALUES ('mg');
INSERT INTO ehr.dosage_units VALUES ('ug');
INSERT INTO ehr.dosage_units VALUES ('ml');
INSERT INTO ehr.dosage_units VALUES ('ounces');
INSERT INTO ehr.dosage_units VALUES ('units');
INSERT INTO ehr.dosage_units VALUES ('mEq');
INSERT INTO ehr.dosage_units VALUES ('IU');
INSERT INTO ehr.dosage_units VALUES ('no units');

-- ----------------------------
-- Table structure for ehr.drug_units
-- ----------------------------
DROP TABLE IF EXISTS ehr.drug_units;
CREATE TABLE ehr.drug_units (
unit varchar(100) PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of drug_units
-- ----------------------------
INSERT INTO ehr.drug_units VALUES ('mg/ml');
INSERT INTO ehr.drug_units VALUES ('units/ml');
INSERT INTO ehr.drug_units VALUES ('ug/ml');
INSERT INTO ehr.drug_units VALUES ('mg/tablet');
INSERT INTO ehr.drug_units VALUES ('mg/capsule');
INSERT INTO ehr.drug_units VALUES ('g/ml');
INSERT INTO ehr.drug_units VALUES ('mg/piece');
INSERT INTO ehr.drug_units VALUES ('mEq/ml');
INSERT INTO ehr.drug_units VALUES ('IU/ml');
INSERT INTO ehr.drug_units VALUES ('600 IU/720 uL');
INSERT INTO ehr.drug_units VALUES ('mg/tsp');
INSERT INTO ehr.drug_units VALUES ('g/tsp');



-- ----------------------------
-- Table structure for ehr.encounter_types
-- ----------------------------
DROP TABLE IF EXISTS ehr.encounter_types;
CREATE TABLE ehr.encounter_types (
category varchar(255) PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of encounter_types
-- ----------------------------
INSERT INTO ehr.encounter_types VALUES ('Physical Exam');
INSERT INTO ehr.encounter_types VALUES ('Necropsy');

-- ----------------------------
-- Table structure for ehr.gender_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.gender_codes;
CREATE TABLE ehr.gender_codes (
Code varchar(255) PRIMARY KEY,
Meaning varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of gender_codes
-- ----------------------------
INSERT INTO ehr.gender_codes VALUES ('c', 'ovexed (female castrate)');
INSERT INTO ehr.gender_codes VALUES ('e', 'male castrate');
INSERT INTO ehr.gender_codes VALUES ('f', 'Female');
INSERT INTO ehr.gender_codes VALUES ('h', 'hermaphrodite');
INSERT INTO ehr.gender_codes VALUES ('m', 'male');
INSERT INTO ehr.gender_codes VALUES ('v', 'vasectomized');





-- ----------------------------
-- Table structure for hematology_morphology
-- ----------------------------
DROP TABLE IF EXISTS ehr.hematology_morphology;
CREATE TABLE ehr.hematology_morphology (
morphology varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of hematology_morphology
-- ----------------------------
INSERT INTO ehr.hematology_morphology VALUES ('MICROCYTOSIS');
INSERT INTO ehr.hematology_morphology VALUES ('ANISOCYTOSIS');
INSERT INTO ehr.hematology_morphology VALUES ('HOWELL JOLLY');
INSERT INTO ehr.hematology_morphology VALUES ('HYPOCHROMIA');
INSERT INTO ehr.hematology_morphology VALUES ('MACROCYTOSIS');
INSERT INTO ehr.hematology_morphology VALUES ('POIKILOCYTOSIS');
INSERT INTO ehr.hematology_morphology VALUES ('POLYCHROMASIA');
INSERT INTO ehr.hematology_morphology VALUES ('SMUDGE CELLS');
INSERT INTO ehr.hematology_morphology VALUES ('SPHEROCYTES');
INSERT INTO ehr.hematology_morphology VALUES ('HYPER SEGS');
INSERT INTO ehr.hematology_morphology VALUES ('TOXIC CHANGE');

-- ----------------------------
-- Table structure for hematology_score
-- ----------------------------
DROP TABLE IF EXISTS ehr.hematology_score;
CREATE TABLE ehr.hematology_score (
score varchar(255) PRIMARY KEY  NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of hematology_score
-- ----------------------------
INSERT INTO ehr.hematology_score VALUES ('slight');
INSERT INTO ehr.hematology_score VALUES ('moderate');
INSERT INTO ehr.hematology_score VALUES ('marked');



-- ----------------------------
-- Table structure for ehr.hold_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.hold_codes;
CREATE TABLE ehr.hold_codes (
Code varchar(255) PRIMARY KEY,
Meaning varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of hold_codes
-- ----------------------------
INSERT INTO ehr.hold_codes VALUES ('ab', 'abortion');
INSERT INTO ehr.hold_codes VALUES ('ag', 'aging - reserves to replace animals in ni');
INSERT INTO ehr.hold_codes VALUES ('bv', 'Bavister');
INSERT INTO ehr.hold_codes VALUES ('db', 'diabetic');
INSERT INTO ehr.hold_codes VALUES ('ds', 'Doctor Stafford');
INSERT INTO ehr.hold_codes VALUES ('gg', 'Goy group');
INSERT INTO ehr.hold_codes VALUES ('iv', 'in vitro');
INSERT INTO ehr.hold_codes VALUES ('ni', 'National Institute of Aging (funded)');
INSERT INTO ehr.hold_codes VALUES ('sa', 'for sale');
INSERT INTO ehr.hold_codes VALUES ('sb', 'stillborn');
INSERT INTO ehr.hold_codes VALUES ('tp', 'testosterone propanate');
INSERT INTO ehr.hold_codes VALUES ('tt', 'dihydrotestosterone');

-- ----------------------------
-- Table structure for ehr.integers
-- ----------------------------
DROP TABLE IF EXISTS ehr.integers;
CREATE TABLE ehr.integers (
Key int4 PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of integers
-- ----------------------------
INSERT INTO ehr.integers VALUES ('0');
INSERT INTO ehr.integers VALUES ('1');
INSERT INTO ehr.integers VALUES ('2');
INSERT INTO ehr.integers VALUES ('3');
INSERT INTO ehr.integers VALUES ('4');
INSERT INTO ehr.integers VALUES ('5');
INSERT INTO ehr.integers VALUES ('6');
INSERT INTO ehr.integers VALUES ('7');
INSERT INTO ehr.integers VALUES ('8');
INSERT INTO ehr.integers VALUES ('9');
INSERT INTO ehr.integers VALUES ('10');
INSERT INTO ehr.integers VALUES ('11');
INSERT INTO ehr.integers VALUES ('12');
INSERT INTO ehr.integers VALUES ('13');
INSERT INTO ehr.integers VALUES ('14');
INSERT INTO ehr.integers VALUES ('15');
INSERT INTO ehr.integers VALUES ('16');
INSERT INTO ehr.integers VALUES ('17');
INSERT INTO ehr.integers VALUES ('18');
INSERT INTO ehr.integers VALUES ('19');
INSERT INTO ehr.integers VALUES ('20');
INSERT INTO ehr.integers VALUES ('21');
INSERT INTO ehr.integers VALUES ('22');
INSERT INTO ehr.integers VALUES ('23');
INSERT INTO ehr.integers VALUES ('24');
INSERT INTO ehr.integers VALUES ('25');
INSERT INTO ehr.integers VALUES ('26');
INSERT INTO ehr.integers VALUES ('27');
INSERT INTO ehr.integers VALUES ('28');
INSERT INTO ehr.integers VALUES ('29');
INSERT INTO ehr.integers VALUES ('30');
INSERT INTO ehr.integers VALUES ('31');
INSERT INTO ehr.integers VALUES ('32');
INSERT INTO ehr.integers VALUES ('33');
INSERT INTO ehr.integers VALUES ('34');
INSERT INTO ehr.integers VALUES ('35');
INSERT INTO ehr.integers VALUES ('36');
INSERT INTO ehr.integers VALUES ('37');
INSERT INTO ehr.integers VALUES ('38');
INSERT INTO ehr.integers VALUES ('39');
INSERT INTO ehr.integers VALUES ('40');
INSERT INTO ehr.integers VALUES ('41');
INSERT INTO ehr.integers VALUES ('42');
INSERT INTO ehr.integers VALUES ('43');
INSERT INTO ehr.integers VALUES ('44');
INSERT INTO ehr.integers VALUES ('45');
INSERT INTO ehr.integers VALUES ('46');
INSERT INTO ehr.integers VALUES ('47');
INSERT INTO ehr.integers VALUES ('48');
INSERT INTO ehr.integers VALUES ('49');
INSERT INTO ehr.integers VALUES ('50');
INSERT INTO ehr.integers VALUES ('51');
INSERT INTO ehr.integers VALUES ('52');
INSERT INTO ehr.integers VALUES ('53');
INSERT INTO ehr.integers VALUES ('54');
INSERT INTO ehr.integers VALUES ('55');
INSERT INTO ehr.integers VALUES ('56');
INSERT INTO ehr.integers VALUES ('57');
INSERT INTO ehr.integers VALUES ('58');
INSERT INTO ehr.integers VALUES ('59');
INSERT INTO ehr.integers VALUES ('60');
INSERT INTO ehr.integers VALUES ('61');
INSERT INTO ehr.integers VALUES ('62');
INSERT INTO ehr.integers VALUES ('63');
INSERT INTO ehr.integers VALUES ('64');
INSERT INTO ehr.integers VALUES ('65');
INSERT INTO ehr.integers VALUES ('66');
INSERT INTO ehr.integers VALUES ('67');
INSERT INTO ehr.integers VALUES ('68');
INSERT INTO ehr.integers VALUES ('69');
INSERT INTO ehr.integers VALUES ('70');
INSERT INTO ehr.integers VALUES ('71');
INSERT INTO ehr.integers VALUES ('72');
INSERT INTO ehr.integers VALUES ('73');
INSERT INTO ehr.integers VALUES ('74');
INSERT INTO ehr.integers VALUES ('75');
INSERT INTO ehr.integers VALUES ('76');
INSERT INTO ehr.integers VALUES ('77');
INSERT INTO ehr.integers VALUES ('78');
INSERT INTO ehr.integers VALUES ('79');
INSERT INTO ehr.integers VALUES ('80');
INSERT INTO ehr.integers VALUES ('81');
INSERT INTO ehr.integers VALUES ('82');
INSERT INTO ehr.integers VALUES ('83');
INSERT INTO ehr.integers VALUES ('84');
INSERT INTO ehr.integers VALUES ('85');
INSERT INTO ehr.integers VALUES ('86');
INSERT INTO ehr.integers VALUES ('87');
INSERT INTO ehr.integers VALUES ('88');
INSERT INTO ehr.integers VALUES ('89');
INSERT INTO ehr.integers VALUES ('90');
INSERT INTO ehr.integers VALUES ('91');
INSERT INTO ehr.integers VALUES ('92');
INSERT INTO ehr.integers VALUES ('93');
INSERT INTO ehr.integers VALUES ('94');
INSERT INTO ehr.integers VALUES ('95');
INSERT INTO ehr.integers VALUES ('96');
INSERT INTO ehr.integers VALUES ('97');
INSERT INTO ehr.integers VALUES ('98');
INSERT INTO ehr.integers VALUES ('99');
INSERT INTO ehr.integers VALUES ('100');


-- ----------------------------
-- Table structure for lab_test_range
-- ----------------------------
DROP TABLE IF EXISTS ehr.lab_test_range;
CREATE TABLE ehr.lab_test_range (
test varchar(255) ,
species varchar(255) ,
gender varchar(255) ,
age_class int2 DEFAULT NULL,
ref_range_min numeric(255),
ref_range_max numeric(255),
RowId serial primary key NOT NULL
)
WITH (OIDS=FALSE)

;



-- ----------------------------
-- Records of lab_test_range
-- ----------------------------
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'f', '1', null, null, '1');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'f', '2', null, null, '2');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'f', '3', '3', '5', '3');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'f', '4', null, null, '4');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'm', '1', null, null, '5');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'm', '2', null, null, '6');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'm', '3', '4', '5', '7');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Cynomolgus', 'm', '4', null, null, '8');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'f', '1', null, null, '9');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'f', '2', null, null, '10');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'f', '3', '3', '6', '11');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'f', '4', null, null, '12');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'm', '1', null, null, '13');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'm', '2', null, null, '14');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'm', '3', '4', '5', '15');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Marmoset', 'm', '4', null, null, '16');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'f', '1', '4', '4', '17');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'f', '2', '4', '5', '18');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'f', '3', '3', '5', '19');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'f', '4', '3', '4', '20');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'm', '1', '3', '5', '21');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'm', '2', '4', '5', '22');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'm', '3', '4', '5', '23');
INSERT INTO ehr.lab_test_range VALUES ('ALB', 'Rhesus', 'm', '4', '3', '4', '24');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'f', '1', null, null, '25');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'f', '2', null, null, '26');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'f', '3', '99', '227', '27');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'f', '4', null, null, '28');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'm', '1', null, null, '29');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'm', '2', null, null, '30');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'm', '3', '30', '552', '31');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Cynomolgus', 'm', '4', null, null, '32');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'f', '1', null, null, '33');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'f', '2', null, null, '34');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'f', '3', '9', '185', '35');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'f', '4', null, null, '36');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'm', '1', null, null, '37');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'm', '2', null, null, '38');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'm', '3', '47', '133', '39');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Marmoset', 'm', '4', null, null, '40');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'f', '1', '472', '1540', '41');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'f', '2', '169', '810', '42');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'f', '3', '33', '212', '43');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'f', '4', '43', '228', '44');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'm', '1', '482', '1433', '45');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'm', '2', '315', '802', '46');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'm', '3', '28', '221', '47');
INSERT INTO ehr.lab_test_range VALUES ('ALKP', 'Rhesus', 'm', '4', '50', '199', '48');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'f', '1', null, null, '49');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'f', '2', null, null, '50');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'f', '3', '8', '24', '51');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'f', '4', null, null, '52');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'm', '1', null, null, '53');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'm', '2', null, null, '54');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'm', '3', '11', '21', '55');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Cynomolgus', 'm', '4', null, null, '56');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'f', '1', null, null, '57');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'f', '2', null, null, '58');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'f', '3', '14', '31', '59');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'f', '4', null, null, '60');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'm', '1', null, null, '61');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'm', '2', null, null, '62');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'm', '3', '13', '35', '63');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Marmoset', 'm', '4', null, null, '64');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'f', '1', '6', '23', '65');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'f', '2', '11', '37', '66');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'f', '3', '11', '27', '67');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'f', '4', '7', '29', '68');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'm', '1', '4', '30', '69');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'm', '2', '12', '30', '70');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'm', '3', '10', '26', '71');
INSERT INTO ehr.lab_test_range VALUES ('BUN', 'Rhesus', 'm', '4', '12', '27', '72');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'f', '1', null, null, '73');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'f', '2', null, null, '74');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'f', '3', '9', '11', '75');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'f', '4', null, null, '76');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'm', '1', null, null, '77');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'm', '2', null, null, '78');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'm', '3', '9', '11', '79');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Cynomolgus', 'm', '4', null, null, '80');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'f', '1', null, null, '81');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'f', '2', null, null, '82');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'f', '3', '9', '12', '83');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'f', '4', null, null, '84');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'm', '1', null, null, '85');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'm', '2', null, null, '86');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'm', '3', '9', '12', '87');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Marmoset', 'm', '4', null, null, '88');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'f', '1', '10', '12', '89');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'f', '2', '9', '11', '90');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'f', '3', '9', '11', '91');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'f', '4', '9', '11', '92');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'm', '1', '10', '12', '93');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'm', '2', '9', '11', '94');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'm', '3', '9', '11', '95');
INSERT INTO ehr.lab_test_range VALUES ('CA', 'Rhesus', 'm', '4', '9', '11', '96');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'f', '1', null, null, '97');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'f', '2', null, null, '98');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'f', '3', '77', '173', '99');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'f', '4', null, null, '100');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'm', '1', null, null, '101');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'm', '2', null, null, '102');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'm', '3', '63', '157', '103');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Cynomolgus', 'm', '4', null, null, '104');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'f', '1', null, null, '105');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'f', '2', null, null, '106');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'f', '3', '64', '180', '107');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'f', '4', null, null, '108');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'm', '1', null, null, '109');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'm', '2', null, null, '110');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'm', '3', '97', '264', '111');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Marmoset', 'm', '4', null, null, '112');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'f', '1', '108', '266', '113');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'f', '2', '108', '195', '114');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'f', '3', '99', '219', '115');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'f', '4', '100', '192', '116');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'm', '1', '109', '295', '117');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'm', '2', '100', '196', '118');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'm', '3', '93', '200', '119');
INSERT INTO ehr.lab_test_range VALUES ('CHOL', 'Rhesus', 'm', '4', '86', '202', '120');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'f', '1', null, null, '121');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'f', '2', null, null, '122');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'f', '3', '104', '110', '123');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'f', '4', null, null, '124');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'm', '1', null, null, '125');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'm', '2', null, null, '126');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'm', '3', '102', '110', '127');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Cynomolgus', 'm', '4', null, null, '128');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'f', '1', null, null, '129');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'f', '2', null, null, '130');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'f', '3', '105', '117', '131');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'f', '4', null, null, '132');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'm', '1', null, null, '133');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'm', '2', null, null, '134');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'm', '3', '104', '116', '135');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Marmoset', 'm', '4', null, null, '136');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'f', '1', '107', '115', '137');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'f', '2', '104', '117', '138');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'f', '3', '104', '116', '139');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'f', '4', '103', '115', '140');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'm', '1', '105', '116', '141');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'm', '2', '104', '114', '142');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'm', '3', '104', '114', '143');
INSERT INTO ehr.lab_test_range VALUES ('CL', 'Rhesus', 'm', '4', '105', '114', '144');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'f', '1', null, null, '145');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'f', '2', null, null, '146');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'f', '3', '0', '1452', '147');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'f', '4', null, null, '148');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'm', '1', null, null, '149');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'm', '2', null, null, '150');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'm', '3', '0', '1189', '151');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Cynomolgus', 'm', '4', null, null, '152');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'f', '1', null, null, '153');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'f', '2', null, null, '154');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'f', '3', null, null, '155');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'f', '4', null, null, '156');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'm', '1', null, null, '157');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'm', '2', null, null, '158');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'm', '3', null, null, '159');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Marmoset', 'm', '4', null, null, '160');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'f', '1', '0', '933', '161');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'f', '2', '0', '1565', '162');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'f', '3', '0', '815', '163');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'f', '4', '0', '593', '164');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'm', '1', '0', '1164', '165');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'm', '2', '0', '938', '166');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'm', '3', '0', '326', '167');
INSERT INTO ehr.lab_test_range VALUES ('CPK', 'Rhesus', 'm', '4', '0', '611', '168');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'f', '1', null, null, '169');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'f', '2', null, null, '170');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'f', '3', '0', '1', '171');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'f', '4', null, null, '172');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'm', '1', null, null, '173');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'm', '2', null, null, '174');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'm', '3', '1', '1', '175');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Cynomolgus', 'm', '4', null, null, '176');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'f', '1', null, null, '177');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'f', '2', null, null, '178');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'f', '3', '0', '1', '179');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'f', '4', null, null, '180');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'm', '1', null, null, '181');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'm', '2', null, null, '182');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'm', '3', '0', '1', '183');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Marmoset', 'm', '4', null, null, '184');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'f', '1', '0', '1', '185');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'f', '2', '1', '1', '186');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'f', '3', '1', '1', '187');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'f', '4', '1', '1', '188');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'm', '1', '1', '1', '189');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'm', '2', '1', '1', '190');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'm', '3', '1', '2', '191');
INSERT INTO ehr.lab_test_range VALUES ('CREAT', 'Rhesus', 'm', '4', '1', '1', '192');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'f', '1', null, null, '193');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'f', '2', null, null, '194');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'f', '3', '66', '174', '195');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'f', '4', null, null, '196');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'm', '1', null, null, '197');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'm', '2', null, null, '198');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'm', '3', '94', '186', '199');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Cynomolgus', 'm', '4', null, null, '200');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'f', '1', null, null, '201');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'f', '2', null, null, '202');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'f', '3', '0', '243', '203');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'f', '4', null, null, '204');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'm', '1', null, null, '205');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'm', '2', null, null, '206');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'm', '3', '72', '178', '207');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Marmoset', 'm', '4', null, null, '208');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'f', '1', '16', '199', '209');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'f', '2', '48', '138', '210');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'f', '3', '58', '192', '211');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'f', '4', '39', '180', '212');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'm', '1', '44', '186', '213');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'm', '2', '69', '187', '214');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'm', '3', '91', '209', '215');
INSERT INTO ehr.lab_test_range VALUES ('FE', 'Rhesus', 'm', '4', '76', '172', '216');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'f', '1', null, null, '217');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'f', '2', null, null, '218');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'f', '3', '14', '88', '219');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'f', '4', null, null, '220');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'm', '1', null, null, '221');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'm', '2', null, null, '222');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'm', '3', '28', '116', '223');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Cynomolgus', 'm', '4', null, null, '224');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'f', '1', null, null, '225');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'f', '2', null, null, '226');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'f', '3', '0', '30', '227');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'f', '4', null, null, '228');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'm', '1', null, null, '229');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'm', '2', null, null, '230');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'm', '3', '0', '17', '231');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Marmoset', 'm', '4', null, null, '232');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'f', '1', '64', '146', '233');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'f', '2', '39', '95', '234');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'f', '3', '23', '57', '235');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'f', '4', '21', '57', '236');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'm', '1', '51', '180', '237');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'm', '2', '47', '106', '238');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'm', '3', '24', '81', '239');
INSERT INTO ehr.lab_test_range VALUES ('GGT', 'Rhesus', 'm', '4', '23', '86', '240');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'f', '1', null, null, '241');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'f', '2', null, null, '242');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'f', '3', '36', '90', '243');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'f', '4', null, null, '244');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'm', '1', null, null, '245');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'm', '2', null, null, '246');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'm', '3', '22', '80', '247');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Cynomolgus', 'm', '4', null, null, '248');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'f', '1', null, null, '249');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'f', '2', null, null, '250');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'f', '3', '55', '211', '251');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'f', '4', null, null, '252');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'm', '1', null, null, '253');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'm', '2', null, null, '254');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'm', '3', '56', '172', '255');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Marmoset', 'm', '4', null, null, '256');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'f', '1', '62', '132', '257');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'f', '2', '42', '110', '258');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'f', '3', '43', '97', '259');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'f', '4', '40', '108', '260');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'm', '1', '67', '125', '261');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'm', '2', '49', '105', '262');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'm', '3', '42', '97', '263');
INSERT INTO ehr.lab_test_range VALUES ('GLUC', 'Rhesus', 'm', '4', '41', '97', '264');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Cynomolgus', 'f', '1', '32', '44', '265');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Cynomolgus', 'm', '1', '34', '46', '266');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'f', '1', '38', '48', '267');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'f', '2', '32', '45', '268');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'f', '3', '36', '49', '269');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'f', '4', '38', '52', '270');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'm', '1', '39', '46', '271');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'm', '2', '35', '46', '272');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'm', '3', '41', '51', '273');
INSERT INTO ehr.lab_test_range VALUES ('HCT', 'Rhesus', 'm', '4', '39', '52', '274');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Cynomolgus', 'f', '1', '11', '14', '275');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Cynomolgus', 'm', '1', '11', '15', '276');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'f', '1', '12', '15', '277');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'f', '2', '11', '14', '278');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'f', '3', '12', '16', '279');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'f', '4', '12', '17', '280');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'm', '1', '13', '15', '281');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'm', '2', '12', '15', '282');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'm', '3', '13', '16', '283');
INSERT INTO ehr.lab_test_range VALUES ('HGB', 'Rhesus', 'm', '4', '13', '17', '284');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'f', '1', null, null, '285');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'f', '2', null, null, '286');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'f', '3', '3', '4', '287');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'f', '4', null, null, '288');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'm', '1', null, null, '289');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'm', '2', null, null, '290');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'm', '3', '3', '5', '291');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Cynomolgus', 'm', '4', null, null, '292');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'f', '1', null, null, '293');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'f', '2', null, null, '294');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'f', '3', '3', '6', '295');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'f', '4', null, null, '296');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'm', '1', null, null, '297');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'm', '2', null, null, '298');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'm', '3', '3', '5', '299');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Marmoset', 'm', '4', null, null, '300');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'f', '1', '3', '6', '301');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'f', '2', '3', '4', '302');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'f', '3', '3', '5', '303');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'f', '4', '3', '5', '304');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'm', '1', '3', '6', '305');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'm', '2', '3', '5', '306');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'm', '3', '3', '5', '307');
INSERT INTO ehr.lab_test_range VALUES ('K', 'Rhesus', 'm', '4', '4', '5', '308');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'f', '1', null, null, '309');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'f', '2', null, null, '310');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'f', '3', '68', '1100', '311');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'f', '4', null, null, '312');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'm', '1', null, null, '313');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'm', '2', null, null, '314');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'm', '3', '0', '1544', '315');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Cynomolgus', 'm', '4', null, null, '316');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'f', '1', null, null, '317');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'f', '2', null, null, '318');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'f', '3', '100', '266', '319');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'f', '4', null, null, '320');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'm', '1', null, null, '321');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'm', '2', null, null, '322');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'm', '3', '103', '253', '323');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Marmoset', 'm', '4', null, null, '324');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'f', '1', '190', '542', '325');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'f', '2', '78', '718', '326');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'f', '3', '45', '469', '327');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'f', '4', '46', '636', '328');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'm', '1', '165', '659', '329');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'm', '2', '180', '535', '330');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'm', '3', '94', '503', '331');
INSERT INTO ehr.lab_test_range VALUES ('LDH', 'Rhesus', 'm', '4', '50', '630', '332');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Cynomolgus', 'f', '1', '23', '26', '333');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Cynomolgus', 'm', '1', '23', '27', '334');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'f', '1', '22', '24', '335');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'f', '2', '21', '26', '336');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'f', '3', '22', '26', '337');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'f', '4', '21', '26', '338');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'm', '1', '21', '26', '339');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'm', '2', '22', '25', '340');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'm', '3', '23', '27', '341');
INSERT INTO ehr.lab_test_range VALUES ('MCH', 'Rhesus', 'm', '4', '22', '26', '342');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Cynomolgus', 'f', '1', '32', '34', '343');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Cynomolgus', 'm', '1', '32', '34', '344');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'f', '1', '31', '33', '345');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'f', '2', '31', '34', '346');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'f', '3', '30', '34', '347');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'f', '4', '30', '34', '348');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'm', '1', '31', '33', '349');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'm', '2', '31', '34', '350');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'm', '3', '30', '34', '351');
INSERT INTO ehr.lab_test_range VALUES ('MCHC', 'Rhesus', 'm', '4', '31', '34', '352');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Cynomolgus', 'f', '1', '68', '80', '353');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Cynomolgus', 'm', '1', '72', '82', '354');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'f', '1', '68', '76', '355');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'f', '2', '67', '76', '356');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'f', '3', '69', '80', '357');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'f', '4', '69', '81', '358');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'm', '1', '68', '79', '359');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'm', '2', '70', '76', '360');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'm', '3', '72', '84', '361');
INSERT INTO ehr.lab_test_range VALUES ('MCV', 'Rhesus', 'm', '4', '70', '81', '362');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Cynomolgus', 'f', '1', '8', '11', '363');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Cynomolgus', 'm', '1', '8', '11', '364');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'f', '1', '9', '13', '365');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'f', '2', '8', '13', '366');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'f', '3', '8', '12', '367');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'f', '4', '7', '13', '368');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'm', '1', '8', '12', '369');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'm', '2', '8', '12', '370');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'm', '3', '8', '12', '371');
INSERT INTO ehr.lab_test_range VALUES ('MPV', 'Rhesus', 'm', '4', '7', '11', '372');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'f', '1', null, null, '373');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'f', '2', null, null, '374');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'f', '3', '143', '147', '375');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'f', '4', null, null, '376');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'm', '1', null, null, '377');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'm', '2', null, null, '378');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'm', '3', '143', '149', '379');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Cynomolgus', 'm', '4', null, null, '380');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'f', '1', null, null, '381');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'f', '2', null, null, '382');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'f', '3', '146', '154', '383');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'f', '4', null, null, '384');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'm', '1', null, null, '385');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'm', '2', null, null, '386');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'm', '3', '148', '157', '387');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Marmoset', 'm', '4', null, null, '388');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'f', '1', '140', '149', '389');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'f', '2', '141', '150', '390');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'f', '3', '141', '152', '391');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'f', '4', '140', '151', '392');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'm', '1', '141', '150', '393');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'm', '2', '140', '152', '394');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'm', '3', '142', '153', '395');
INSERT INTO ehr.lab_test_range VALUES ('NA', 'Rhesus', 'm', '4', '143', '150', '396');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'f', '1', null, null, '397');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'f', '2', null, null, '398');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'f', '3', '3', '6', '399');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'f', '4', null, null, '400');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'm', '1', null, null, '401');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'm', '2', null, null, '402');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'm', '3', '4', '7', '403');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Cynomolgus', 'm', '4', null, null, '404');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'f', '1', null, null, '405');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'f', '2', null, null, '406');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'f', '3', '2', '7', '407');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'f', '4', null, null, '408');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'm', '1', null, null, '409');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'm', '2', null, null, '410');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'm', '3', '3', '6', '411');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Marmoset', 'm', '4', null, null, '412');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'f', '1', '5', '8', '413');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'f', '2', '3', '7', '414');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'f', '3', '2', '6', '415');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'f', '4', '2', '6', '416');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'm', '1', '5', '8', '417');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'm', '2', '4', '8', '418');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'm', '3', '2', '6', '419');
INSERT INTO ehr.lab_test_range VALUES ('PHOS', 'Rhesus', 'm', '4', '3', '6', '420');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Cynomolgus', 'f', '1', '232', '522', '421');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Cynomolgus', 'm', '1', '269', '489', '422');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'f', '1', '341', '678', '423');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'f', '2', '277', '620', '424');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'f', '3', '229', '524', '425');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'f', '4', '197', '482', '426');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'm', '1', '333', '682', '427');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'm', '2', '308', '603', '428');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'm', '3', '231', '491', '429');
INSERT INTO ehr.lab_test_range VALUES ('PLT', 'Rhesus', 'm', '4', '236', '551', '430');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Cynomolgus', 'f', '1', '4', '6', '431');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Cynomolgus', 'm', '1', '4', '6', '432');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'f', '1', '5', '7', '433');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'f', '2', '4', '6', '434');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'f', '3', '5', '7', '435');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'f', '4', '5', '7', '436');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'm', '1', '5', '6', '437');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'm', '2', '5', '6', '438');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'm', '3', '5', '7', '439');
INSERT INTO ehr.lab_test_range VALUES ('RBC', 'Rhesus', 'm', '4', '5', '7', '440');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Cynomolgus', 'f', '1', '11', '13', '441');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Cynomolgus', 'm', '1', '11', '13', '442');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'f', '1', '11', '15', '443');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'f', '2', '11', '14', '444');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'f', '3', '11', '15', '445');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'f', '4', '11', '14', '446');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'm', '1', '11', '15', '447');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'm', '2', '12', '14', '448');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'm', '3', '11', '14', '449');
INSERT INTO ehr.lab_test_range VALUES ('RDW', 'Rhesus', 'm', '4', '10', '17', '450');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'f', '1', null, null, '451');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'f', '2', null, null, '452');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'f', '3', '23', '63', '453');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'f', '4', null, null, '454');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'm', '1', null, null, '455');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'm', '2', null, null, '456');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'm', '3', '24', '66', '457');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Cynomolgus', 'm', '4', null, null, '458');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'f', '1', null, null, '459');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'f', '2', null, null, '460');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'f', '3', '68', '178', '461');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'f', '4', null, null, '462');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'm', '1', null, null, '463');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'm', '2', null, null, '464');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'm', '3', '89', '171', '465');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Marmoset', 'm', '4', null, null, '466');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'f', '1', '26', '69', '467');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'f', '2', '23', '64', '468');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'f', '3', '15', '48', '469');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'f', '4', '17', '54', '470');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'm', '1', '30', '70', '471');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'm', '2', '29', '69', '472');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'm', '3', '16', '50', '473');
INSERT INTO ehr.lab_test_range VALUES ('SGOT', 'Rhesus', 'm', '4', '22', '49', '474');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'f', '1', null, null, '475');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'f', '2', null, null, '476');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'f', '3', '13', '69', '477');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'f', '4', null, null, '478');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'm', '1', null, null, '479');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'm', '2', null, null, '480');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'm', '3', '18', '54', '481');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Cynomolgus', 'm', '4', null, null, '482');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'f', '1', null, null, '483');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'f', '2', null, null, '484');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'f', '3', '0', '17', '485');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'f', '4', null, null, '486');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'm', '1', null, null, '487');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'm', '2', null, null, '488');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'm', '3', '1', '12', '489');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Marmoset', 'm', '4', null, null, '490');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'f', '1', '13', '39', '491');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'f', '2', '18', '45', '492');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'f', '3', '6', '48', '493');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'f', '4', '9', '54', '494');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'm', '1', '11', '45', '495');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'm', '2', '16', '51', '496');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'm', '3', '6', '64', '497');
INSERT INTO ehr.lab_test_range VALUES ('SGPT', 'Rhesus', 'm', '4', '13', '63', '498');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'f', '1', null, null, '499');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'f', '2', null, null, '500');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'f', '3', '0', '0', '501');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'f', '4', null, null, '502');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'm', '1', null, null, '503');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'm', '2', null, null, '504');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'm', '3', '0', '0', '505');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Cynomolgus', 'm', '4', null, null, '506');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'f', '1', null, null, '507');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'f', '2', null, null, '508');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'f', '3', '0', '0', '509');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'f', '4', null, null, '510');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'm', '1', null, null, '511');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'm', '2', null, null, '512');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'm', '3', '0', '1', '513');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Marmoset', 'm', '4', null, null, '514');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'f', '1', '0', '0', '515');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'f', '2', '0', '0', '516');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'f', '3', '0', '1', '517');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'f', '4', '0', '0', '518');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'm', '1', '0', '0', '519');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'm', '2', '0', '0', '520');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'm', '3', '0', '0', '521');
INSERT INTO ehr.lab_test_range VALUES ('TB', 'Rhesus', 'm', '4', '0', '0', '522');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'f', '1', null, null, '523');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'f', '2', null, null, '524');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'f', '3', '6', '8', '525');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'f', '4', null, null, '526');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'm', '1', null, null, '527');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'm', '2', null, null, '528');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'm', '3', '7', '8', '529');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Cynomolgus', 'm', '4', null, null, '530');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'f', '1', null, null, '531');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'f', '2', null, null, '532');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'f', '3', '6', '9', '533');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'f', '4', null, null, '534');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'm', '1', null, null, '535');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'm', '2', null, null, '536');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'm', '3', '7', '9', '537');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Marmoset', 'm', '4', null, null, '538');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'f', '1', '6', '7', '539');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'f', '2', '6', '7', '540');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'f', '3', '6', '8', '541');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'f', '4', '6', '8', '542');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'm', '1', '6', '8', '543');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'm', '2', '6', '7', '544');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'm', '3', '7', '8', '545');
INSERT INTO ehr.lab_test_range VALUES ('TP', 'Rhesus', 'm', '4', '6', '9', '546');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'f', '1', null, null, '547');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'f', '2', null, null, '548');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'f', '3', '0', '98', '549');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'f', '4', null, null, '550');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'm', '1', null, null, '551');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'm', '2', null, null, '552');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'm', '3', '5', '121', '553');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Cynomolgus', 'm', '4', null, null, '554');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'f', '1', null, null, '555');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'f', '2', null, null, '556');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'f', '3', '0', '541', '557');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'f', '4', null, null, '558');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'm', '1', null, null, '559');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'm', '2', null, null, '560');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'm', '3', '4', '304', '561');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Marmoset', 'm', '4', null, null, '562');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'f', '1', '15', '68', '563');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'f', '2', '0', '96', '564');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'f', '3', '0', '164', '565');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'f', '4', '0', '385', '566');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'm', '1', '2', '92', '567');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'm', '2', '0', '128', '568');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'm', '3', '0', '119', '569');
INSERT INTO ehr.lab_test_range VALUES ('TRIG', 'Rhesus', 'm', '4', '0', '305', '570');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'f', '1', null, null, '571');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'f', '2', null, null, '572');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'f', '3', null, null, '573');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'f', '4', null, null, '574');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'm', '1', null, null, '575');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'm', '2', null, null, '576');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'm', '3', null, null, '577');
INSERT INTO ehr.lab_test_range VALUES ('UA', 'Marmoset', 'm', '4', null, null, '578');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Cynomolgus', 'f', '1', '6', '18', '579');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Cynomolgus', 'm', '1', '8', '16', '580');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'f', '1', '7', '21', '581');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'f', '2', '4', '20', '582');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'f', '3', '4', '16', '583');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'f', '4', '4', '13', '584');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'm', '1', '7', '18', '585');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'm', '2', '6', '18', '586');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'm', '3', '4', '12', '587');
INSERT INTO ehr.lab_test_range VALUES ('WBC', 'Rhesus', 'm', '4', '4', '13', '588');

-- ----------------------------
-- Table structure for mhc_institutions
-- ----------------------------
DROP TABLE IF EXISTS ehr.mhc_institutions;
CREATE TABLE ehr.mhc_institutions (
technique varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of mhc_institutions
-- ----------------------------


-- ----------------------------
-- Table structure for ehr.months
-- ----------------------------
DROP TABLE IF EXISTS ehr.months;
CREATE TABLE ehr.months (
rowId serial PRIMARY KEY,
month varchar(255) not null
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of months
-- ----------------------------
INSERT into ehr.months (month) VALUES
('January'),
('February'),
('March'),
('April'),
('May'),
('June'),
('July'),
('August'),
('September'),
('October'),
('November'),
('December');



-- ----------------------------
-- Table structure for necropsy_condition
-- ----------------------------
DROP TABLE IF EXISTS ehr.necropsy_condition;
CREATE TABLE ehr.necropsy_condition (
score varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;


-- ----------------------------
-- Records of necropsy_condition
-- ----------------------------

-- ----------------------------
-- Table structure for necropsy_perfusion
-- ----------------------------
DROP TABLE IF EXISTS ehr.necropsy_perfusion;
CREATE TABLE ehr.necropsy_perfusion (
perfusion varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of necropsy_perfusion
-- ----------------------------
INSERT INTO ehr.necropsy_perfusion VALUES ('4% PFA');
INSERT INTO ehr.necropsy_perfusion VALUES ('2% PFA');
INSERT INTO ehr.necropsy_perfusion VALUES ('Saline');
INSERT INTO ehr.necropsy_perfusion VALUES ('Other');

-- ----------------------------
-- Table structure for necropsy_perfusion_area
-- ----------------------------
DROP TABLE IF EXISTS ehr.necropsy_perfusion_area;
CREATE TABLE ehr.necropsy_perfusion_area (
perfusion varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of necropsy_perfusion_area
-- ----------------------------
INSERT INTO ehr.necropsy_perfusion_area VALUES ('Upper Body');
INSERT INTO ehr.necropsy_perfusion_area VALUES ('Whole Body');

-- ----------------------------
-- Table structure for pairtest_bhav
-- ----------------------------
DROP TABLE IF EXISTS ehr.pairtest_bhav;
CREATE TABLE ehr.pairtest_bhav (
value varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of pairtest_bhav
-- ----------------------------
INSERT INTO ehr.pairtest_bhav VALUES ('gradual');
INSERT INTO ehr.pairtest_bhav VALUES ('protected contact');
INSERT INTO ehr.pairtest_bhav VALUES ('re-pair');

-- ----------------------------
-- Table structure for pairtest_conclusion
-- ----------------------------
DROP TABLE IF EXISTS ehr.pairtest_conclusion;
CREATE TABLE ehr.pairtest_conclusion (
value varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of pairtest_conclusion
-- ----------------------------
INSERT INTO ehr.pairtest_conclusion VALUES ('Compatible, will pair');
INSERT INTO ehr.pairtest_conclusion VALUES ('Incompatible, will not pair');
INSERT INTO ehr.pairtest_conclusion VALUES ('Inconclusive, another test is needed');
INSERT INTO ehr.pairtest_conclusion VALUES ('Successfully paired');

-- ----------------------------
-- Table structure for pe_region
-- ----------------------------
DROP TABLE IF EXISTS ehr.pe_region;
CREATE TABLE ehr.pe_region (
region varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of pe_region
-- ----------------------------
INSERT INTO ehr.pe_region VALUES ('Head');
INSERT INTO ehr.pe_region VALUES ('Lymph Nodes');
INSERT INTO ehr.pe_region VALUES ('Cardiac Auscultation');
INSERT INTO ehr.pe_region VALUES ('Thoracic Auscultation');
INSERT INTO ehr.pe_region VALUES ('Abdominal Palpation');
INSERT INTO ehr.pe_region VALUES ('Joints');
INSERT INTO ehr.pe_region VALUES ('Other');



-- ----------------------------
-- Table structure for ehr.obs_behavior
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_behavior;
CREATE TABLE ehr.obs_behavior (
code varchar PRIMARY KEY,
meaning varchar DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_behavior
-- ----------------------------
INSERT INTO ehr.obs_behavior VALUES ('NP', null);
INSERT INTO ehr.obs_behavior VALUES ('OG', null);
INSERT INTO ehr.obs_behavior VALUES ('P', null);
INSERT INTO ehr.obs_behavior VALUES ('S', null);
INSERT INTO ehr.obs_behavior VALUES ('F', null);
INSERT INTO ehr.obs_behavior VALUES ('SIB', null);

-- ----------------------------
-- Table structure for ehr.obs_breeding
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_breeding;
CREATE TABLE ehr.obs_breeding (
code varchar PRIMARY KEY,
meaning varchar DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_breeding
-- ----------------------------
INSERT INTO ehr.obs_breeding VALUES ('E', null);
INSERT INTO ehr.obs_breeding VALUES ('NOE', null);
INSERT INTO ehr.obs_breeding VALUES ('N/A', null);

-- ----------------------------
-- Table structure for ehr.obs_feces
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_feces;
CREATE TABLE ehr.obs_feces (
code varchar PRIMARY KEY,
meaning varchar DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_feces
-- ----------------------------
INSERT INTO ehr.obs_feces VALUES ('SF', null);
INSERT INTO ehr.obs_feces VALUES ('FS', null);
INSERT INTO ehr.obs_feces VALUES ('BF', null);
INSERT INTO ehr.obs_feces VALUES ('D', null);
INSERT INTO ehr.obs_feces VALUES ('WD', null);
INSERT INTO ehr.obs_feces VALUES ('B', null);
INSERT INTO ehr.obs_feces VALUES ('MU', null);

-- ----------------------------
-- Table structure for ehr.obs_mens
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_mens;
CREATE TABLE ehr.obs_mens (
code varchar PRIMARY KEY,
meaning varchar DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_mens
-- ----------------------------
INSERT INTO ehr.obs_mens VALUES ('M', null);
INSERT INTO ehr.obs_mens VALUES ('LM', null);
INSERT INTO ehr.obs_mens VALUES ('HM', null);
INSERT INTO ehr.obs_mens VALUES ('PPM', null);
INSERT INTO ehr.obs_mens VALUES ('HPPM', null);

-- ----------------------------
-- Table structure for ehr.obs_other
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_other;
CREATE TABLE ehr.obs_other (
code varchar PRIMARY KEY,
meaning varchar DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_other
-- ----------------------------
INSERT INTO ehr.obs_other VALUES ('V', null);
INSERT INTO ehr.obs_other VALUES ('NE', null);
INSERT INTO ehr.obs_other VALUES ('L', null);
INSERT INTO ehr.obs_other VALUES ('RP', null);
INSERT INTO ehr.obs_other VALUES ('VP', null);
INSERT INTO ehr.obs_other VALUES ('N', null);
INSERT INTO ehr.obs_other VALUES ('T', null);

-- ----------------------------
-- Table structure for ehr.obs_remarks
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_remarks;
CREATE TABLE ehr.obs_remarks (
remark varchar PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_remarks
-- ----------------------------

-- ----------------------------
-- Table structure for ehr.obs_tlocation
-- ----------------------------
DROP TABLE IF EXISTS ehr.obs_tlocation;
CREATE TABLE ehr.obs_tlocation (
code varchar PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_tlocation
-- ----------------------------

-- ----------------------------
-- Table structure for ehr.origin_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.origin_codes;
CREATE TABLE ehr.origin_codes (
Code varchar(255) PRIMARY KEY,
Meaning varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of origin_codes
-- ----------------------------
INSERT INTO ehr.origin_codes VALUES ('abl', 'Advanced Bioscience Laboratories');
INSERT INTO ehr.origin_codes VALUES ('avp', 'Aventis Pasteur, Toronto, Ontario Canada');
INSERT INTO ehr.origin_codes VALUES ('bab', 'Brooks Air Force Base, TX');
INSERT INTO ehr.origin_codes VALUES ('bmy', 'Bristol Meyers Labs, IN');
INSERT INTO ehr.origin_codes VALUES ('bos', 'Boston');
INSERT INTO ehr.origin_codes VALUES ('bqi', 'Bioqual Inc, Rockville MD');
INSERT INTO ehr.origin_codes VALUES ('brl', 'Biologic Resources Lab, Univ of IL/ Chicago');
INSERT INTO ehr.origin_codes VALUES ('bru', 'Brown University, Warwick, RI');
INSERT INTO ehr.origin_codes VALUES ('btl', 'Industrial Biotest Laboratory');
INSERT INTO ehr.origin_codes VALUES ('cal', 'California');
INSERT INTO ehr.origin_codes VALUES ('cen', 'WNPRC');
INSERT INTO ehr.origin_codes VALUES ('cpc', 'Caribbean Primate Center');
INSERT INTO ehr.origin_codes VALUES ('crh', 'Charles River Brf, Houston Texas');
INSERT INTO ehr.origin_codes VALUES ('crp', 'Covance Research Products');
INSERT INTO ehr.origin_codes VALUES ('csc', 'Clinical Science Clinic, Madison, WI');
INSERT INTO ehr.origin_codes VALUES ('csp', 'Central State Primates, Kaiser, MO');
INSERT INTO ehr.origin_codes VALUES ('cuw', 'Catholic University, Washington, DE');
INSERT INTO ehr.origin_codes VALUES ('dfs', 'Department Of Food Science, Madison, WI');
INSERT INTO ehr.origin_codes VALUES ('fer', 'Feral');
INSERT INTO ehr.origin_codes VALUES ('fri', 'Food Research Inst, UW-Madison');
INSERT INTO ehr.origin_codes VALUES ('haw', 'Hawaii');
INSERT INTO ehr.origin_codes VALUES ('hmc', 'Hershey Medical Center Hershey, PA');
INSERT INTO ehr.origin_codes VALUES ('hms', 'Harvard Medical School, New England Primate Center, Southborough MA');
INSERT INTO ehr.origin_codes VALUES ('hzt', 'Hazelton Labs, Madison, WI');
INSERT INTO ehr.origin_codes VALUES ('lab', 'Harlow Primate Lab, UW-Madison');
INSERT INTO ehr.origin_codes VALUES ('lbi', 'Litton Bionetics');
INSERT INTO ehr.origin_codes VALUES ('lbs', 'Laboratory Animal Breeders & Services, Yemassee, SC');
INSERT INTO ehr.origin_codes VALUES ('loy', 'Dr. Loy');
INSERT INTO ehr.origin_codes VALUES ('lsp', 'Lensip Tuxedo, NY');
INSERT INTO ehr.origin_codes VALUES ('mds', 'University of WI Medical School');
INSERT INTO ehr.origin_codes VALUES ('mic', 'Michigan');
INSERT INTO ehr.origin_codes VALUES ('mrb', 'Miami Rare Bird Farm');
INSERT INTO ehr.origin_codes VALUES ('opc', 'Oregon Primate Center');
INSERT INTO ehr.origin_codes VALUES ('pfi', 'Pfizer, Kalamazoo MI');
INSERT INTO ehr.origin_codes VALUES ('pii', 'Primate Imports Inc.');
INSERT INTO ehr.origin_codes VALUES ('pit', 'University Of Pittsburg');
INSERT INTO ehr.origin_codes VALUES ('pli', 'Primelabs Inc.');
INSERT INTO ehr.origin_codes VALUES ('pr', 'Puerto Rico');
INSERT INTO ehr.origin_codes VALUES ('sfi', 'Shamrock Farms Inc.');
INSERT INTO ehr.origin_codes VALUES ('snb', 'Shin Nippon Biomedical Labs, Everett, WA');
INSERT INTO ehr.origin_codes VALUES ('sun', 'State University of New York At Syracuse');
INSERT INTO ehr.origin_codes VALUES ('tpc', 'Texas Primate Center');
INSERT INTO ehr.origin_codes VALUES ('tss', 'Three Springs Scientific, Yemassee, SC');
INSERT INTO ehr.origin_codes VALUES ('tul', 'Tulsa Zoo');
INSERT INTO ehr.origin_codes VALUES ('ucd', 'Univ. of California-Davis Primate Center');
INSERT INTO ehr.origin_codes VALUES ('ucr', 'University Of California-Riverside, Riverside, CA');
INSERT INTO ehr.origin_codes VALUES ('vs', 'Veterinary Science from Hazleton Labs');
INSERT INTO ehr.origin_codes VALUES ('wac', 'Woodard Asiatic Corporation');
INSERT INTO ehr.origin_codes VALUES ('wai', 'Waisman Center, Madison, WI');
INSERT INTO ehr.origin_codes VALUES ('wnc', 'Winston-Salem, NC');
INSERT INTO ehr.origin_codes VALUES ('wvh', 'VA Hospital, Wood, WI');
INSERT INTO ehr.origin_codes VALUES ('ypc', 'Yerkes Primate Center, Atlanta, GA');
INSERT INTO ehr.origin_codes VALUES ('zoo', 'Zoology, UW-Madison');



-- ----------------------------
-- Table structure for restraint_type
-- ----------------------------
DROP TABLE IF EXISTS ehr.restraint_type;
CREATE TABLE ehr.restraint_type (
code varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of restraint_type
-- ----------------------------
INSERT INTO ehr.restraint_type VALUES ('Table-Top');
INSERT INTO ehr.restraint_type VALUES ('Tube');
INSERT INTO ehr.restraint_type VALUES ('Other');

-- ----------------------------
-- Table structure for tb_eye
-- ----------------------------
DROP TABLE IF EXISTS ehr.tb_eye;
CREATE TABLE ehr.tb_eye (
eye varchar(255) PRIMARY KEY NOT NULL,
meaning varchar(255) 
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of tb_eye
-- ----------------------------
INSERT INTO ehr.tb_eye VALUES ('b', 'Both');
INSERT INTO ehr.tb_eye VALUES ('l', 'Left');
INSERT INTO ehr.tb_eye VALUES ('r', 'Right');

-- ----------------------------
-- Table structure for tb_result
-- ----------------------------
DROP TABLE IF EXISTS ehr.tb_result;
CREATE TABLE ehr.tb_result (
result varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of tb_result
-- ----------------------------
INSERT INTO ehr.tb_result VALUES ('0');
INSERT INTO ehr.tb_result VALUES ('1');
INSERT INTO ehr.tb_result VALUES ('2');
INSERT INTO ehr.tb_result VALUES ('3');
INSERT INTO ehr.tb_result VALUES ('4');
INSERT INTO ehr.tb_result VALUES ('5');

-- ----------------------------
-- Table structure for treatment_frequency
-- ----------------------------
DROP TABLE IF EXISTS ehr.treatment_frequency;
CREATE TABLE ehr.treatment_frequency (
RowId serial PRIMARY KEY NOT NULL,
meaning varchar(32) DEFAULT NULL NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of treatment_frequency
-- ----------------------------
INSERT INTO ehr.treatment_frequency VALUES ('1', 'DAILYAM');
INSERT INTO ehr.treatment_frequency VALUES ('2', 'TWICEAMPM');
INSERT INTO ehr.treatment_frequency VALUES ('3', 'THREE');
INSERT INTO ehr.treatment_frequency VALUES ('4', 'DAILYPM');
INSERT INTO ehr.treatment_frequency VALUES ('5', 'DAILYNIGHT');
INSERT INTO ehr.treatment_frequency VALUES ('6', 'TWICEAMNIGHT');
INSERT INTO ehr.treatment_frequency VALUES ('7', 'WEEKLY');
INSERT INTO ehr.treatment_frequency VALUES ('8', 'MONTHLY');
INSERT INTO ehr.treatment_frequency VALUES ('9', 'ALTDAYS');

-- ----------------------------
-- Table structure for viral_status
-- ----------------------------
DROP TABLE IF EXISTS ehr.viral_status;
CREATE TABLE ehr.viral_status (
viral_status varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of viral_status
-- ----------------------------
INSERT INTO ehr.viral_status VALUES ('SPF');
INSERT INTO ehr.viral_status VALUES ('Conventional');
INSERT INTO ehr.viral_status VALUES ('Not Defined');
INSERT INTO ehr.viral_status VALUES ('Viral Free');

-- ----------------------------
-- Table structure for vl_category
-- ----------------------------
DROP TABLE IF EXISTS ehr.vl_category;
CREATE TABLE ehr.vl_category (
category varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of vl_category
-- ----------------------------
INSERT INTO ehr.vl_category VALUES ('CTL');
INSERT INTO ehr.vl_category VALUES ('Sample');
INSERT INTO ehr.vl_category VALUES ('STD');

-- ----------------------------
-- Table structure for vl_instrument
-- ----------------------------
DROP TABLE IF EXISTS ehr.vl_instrument;
CREATE TABLE ehr.vl_instrument (
instrument varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of vl_instrument
-- ----------------------------
INSERT INTO ehr.vl_instrument VALUES ('LC480');
INSERT INTO ehr.vl_instrument VALUES ('Light Cycler');

-- ----------------------------
-- Table structure for vl_sampletype
-- ----------------------------
DROP TABLE IF EXISTS ehr.vl_sampletype;
CREATE TABLE ehr.vl_sampletype (
sample_type varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of vl_sampletype
-- ----------------------------
INSERT INTO ehr.vl_sampletype VALUES ('gDNA');
INSERT INTO ehr.vl_sampletype VALUES ('vRNA');

-- ----------------------------
-- Table structure for vl_technique
-- ----------------------------
DROP TABLE IF EXISTS ehr.vl_technique;
CREATE TABLE ehr.vl_technique (
technique varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of vl_technique
-- ----------------------------
INSERT INTO ehr.vl_technique VALUES ('Lifson 1-Step VL');

-- ----------------------------
-- Table structure for vl_virus
-- ----------------------------
DROP TABLE IF EXISTS ehr.vl_virus;
CREATE TABLE ehr.vl_virus (
virus varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of vl_virus
-- ----------------------------
INSERT INTO ehr.vl_virus VALUES ('SIVmac239');

-- ----------------------------
-- Table structure for yesno
-- ----------------------------
DROP TABLE IF EXISTS ehr.yesno;
CREATE TABLE ehr.yesno (
value varchar(255) PRIMARY KEY NOT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of yesno
-- ----------------------------
INSERT INTO ehr.yesno VALUES ('Yes');
INSERT INTO ehr.yesno VALUES ('No');
INSERT INTO ehr.yesno VALUES ('NA');

-- ----------------------------
-- Table structure for ehr.reports
-- ----------------------------
DROP TABLE IF EXISTS ehr.reports;
CREATE TABLE ehr.reports (
RowId serial PRIMARY KEY,
ReportName varchar(255) DEFAULT NULL,
Category varchar(255) DEFAULT NULL,
ReportType varchar(255) DEFAULT NULL,
ReportTitle varchar(255) DEFAULT NULL,
Visible bool DEFAULT NULL,
ContainerPath varchar(255) DEFAULT NULL,
SchemaName varchar(255) DEFAULT NULL,
QueryName varchar(255) DEFAULT NULL,
ViewName varchar(255) DEFAULT NULL,
Report varchar(255) DEFAULT NULL,
DateFieldName varchar(255) DEFAULT NULL,
TodayOnly bool DEFAULT NULL,
QueryHasLocation bool DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of reports
-- ----------------------------



-- ----------------------------
-- Table structure for ehr.routes
-- ----------------------------
DROP TABLE IF EXISTS ehr.routes;
CREATE TABLE ehr.routes (
route varchar(100) PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of routes
-- ----------------------------
INSERT INTO ehr.routes VALUES ('IM');
INSERT INTO ehr.routes VALUES ('IT');
INSERT INTO ehr.routes VALUES ('IV');
INSERT INTO ehr.routes VALUES ('oral');
INSERT INTO ehr.routes VALUES ('rectal');
INSERT INTO ehr.routes VALUES ('SQ');
INSERT INTO ehr.routes VALUES ('topical (eye)');
INSERT INTO ehr.routes VALUES ('topical (skin)');
INSERT INTO ehr.routes VALUES ('topical');

-- ----------------------------
-- Table structure for ehr.species
-- ----------------------------
DROP TABLE IF EXISTS ehr.species;
CREATE TABLE ehr.species (
common varchar(255) PRIMARY KEY,
scientific_name varchar(255) DEFAULT NULL,
id_prefix varchar(255) DEFAULT NULL,
mhc_prefix varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of species
-- ----------------------------
INSERT INTO ehr.species VALUES ('Baboon', '', '', '');
INSERT INTO ehr.species VALUES ('Cotton-top Tamarin', 'Saguinus oedipus', 'so', 'Saoe');
INSERT INTO ehr.species VALUES ('Cynomolgus', 'Macaca fascicularis', 'cy', 'Mafa');
INSERT INTO ehr.species VALUES ('Marmoset', 'Callithrix jacchus', 'cj', 'Caja');
INSERT INTO ehr.species VALUES ('Pigtail', 'Macaca Nemestrina', '', 'Mane');
INSERT INTO ehr.species VALUES ('Rhesus', 'Macaca mulatta', 'r|rh', 'Mamu');
INSERT INTO ehr.species VALUES ('Sooty Mangabey', 'Cercocebus atys', '', 'Ceat');
INSERT INTO ehr.species VALUES ('Stump Tailed', 'Macaca Arctoides', '', 'Maar');
INSERT INTO ehr.species VALUES ('Vervet', 'Chlorocebus sabaeus', 'ag', 'Chsa');

-- ----------------------------
-- Table structure for ehr.species_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.species_codes;
CREATE TABLE ehr.species_codes (
code varchar(255) PRIMARY KEY,
scientific_name varchar(255) DEFAULT NULL,
common_name varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of species_codes
-- ----------------------------
INSERT INTO ehr.species_codes VALUES ('ag', 'Chlorocebus sabaeus', 'Vervet');
INSERT INTO ehr.species_codes VALUES ('cj', 'Callithrix jacchus', 'Marmoset');
INSERT INTO ehr.species_codes VALUES ('cy', 'Macaca fascicularis', 'Cynomolgus');
INSERT INTO ehr.species_codes VALUES ('r', 'Macaca mulatta', 'Rhesus');
INSERT INTO ehr.species_codes VALUES ('rh', 'Macaca mulatta', 'Rhesus');
INSERT INTO ehr.species_codes VALUES ('so', 'Saguinus oedipus', 'Cotton-top Tamarin');

-- ----------------------------
-- Table structure for ehr.status_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.status_codes;
CREATE TABLE ehr.status_codes (
Code varchar(20) PRIMARY KEY,
Meaning varchar(255) DEFAULT NULL
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of status_codes
-- ----------------------------
INSERT INTO ehr.status_codes VALUES ('alive', 'alive');
INSERT INTO ehr.status_codes VALUES ('d-expr', 'died experimentally (e.g., sacrifice)');
INSERT INTO ehr.status_codes VALUES ('d-othr', 'died for other reason (e.g., clinical death)');
INSERT INTO ehr.status_codes VALUES ('d-quar', 'died in quarantine');
INSERT INTO ehr.status_codes VALUES ('shippd', 'shipped');


-- ----------------------------
-- Table structure for ehr.virus_snomed
-- ----------------------------
DROP TABLE IF EXISTS ehr.virus_snomed;
CREATE TABLE ehr.virus_snomed (
pathogen varchar(255) DEFAULT NULL,
challenge_type varchar(255) DEFAULT NULL,
code varchar(255) DEFAULT NULL,
RowId serial PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of virus_snomed
-- ----------------------------
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'l-35230');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', '@e-37301');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'l-35260');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', '@e-37302');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10049');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10050');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10154');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10156');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'w-10164');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10172');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10173');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10174');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10175');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10176');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10177');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10178');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10179');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10180');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10181');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10182');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10183');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10184');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10187');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10189');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10190');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10191');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'w-10196');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'w-10205');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'w-10253');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Challenge', 'w-10264');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10290');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10296');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10311');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10312');
INSERT INTO ehr.virus_snomed VALUES ('SIV', 'Vaccine', 'w-10313');


-- ----------------------------
-- Table structure for ehr.volume_units
-- ----------------------------
DROP TABLE IF EXISTS ehr.volume_units;
CREATE TABLE ehr.volume_units (
unit varchar(100) PRIMARY KEY
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of volume_units
-- ----------------------------
INSERT INTO ehr.volume_units VALUES ('mL');
INSERT INTO ehr.volume_units VALUES ('drop(s)');
INSERT INTO ehr.volume_units VALUES ('tablet(s)');
INSERT INTO ehr.volume_units VALUES ('capsule(s)');
INSERT INTO ehr.volume_units VALUES ('tsp');
INSERT INTO ehr.volume_units VALUES ('piece(s)');



-- ----------------------------
-- Table structure for avail_codes
-- ----------------------------
DROP TABLE IF EXISTS ehr.avail_codes;
CREATE TABLE ehr.avail_codes (
code varchar(4000) PRIMARY KEY NOT NULL,
meaning varchar(4000)
)
WITH (OIDS=FALSE)

;


-- ----------------------------
-- Records of avail_codes
-- ----------------------------
INSERT INTO ehr.avail_codes VALUES ('a', 'assigned to a project');
INSERT INTO ehr.avail_codes VALUES ('b', 'assigned to the breeding project');
INSERT INTO ehr.avail_codes VALUES ('c', 'under consideration for assignment');
INSERT INTO ehr.avail_codes VALUES ('m', 'medical exempt');
INSERT INTO ehr.avail_codes VALUES ('n', 'assigned to nia set-aside project');
INSERT INTO ehr.avail_codes VALUES ('p', 'assignment to project is pending');
INSERT INTO ehr.avail_codes VALUES ('q', 'assigned to quarantine project');
INSERT INTO ehr.avail_codes VALUES ('r', 'assigned to a research project');
INSERT INTO ehr.avail_codes VALUES ('t', 'assigned to the training project');
INSERT INTO ehr.avail_codes VALUES ('u', 'unassigned');
INSERT INTO ehr.avail_codes VALUES ('v', 'vet exempt');



-- ----------------------------
-- Table structure for ehr.lab_tests
-- ----------------------------
DROP TABLE IF EXISTS ehr.lab_tests;
CREATE TABLE ehr.lab_tests (
testid varchar(100) PRIMARY KEY,
name varchar(100),
units varchar(100)
)
WITH (OIDS=FALSE)
;



-- ----------------------------
-- Records of lab_tests
-- ----------------------------
INSERT INTO ehr.lab_tests VALUES ('A/P', 'Albumin/Protein Ratio', 'ratio');
INSERT INTO ehr.lab_tests VALUES ('ALB', 'Albumin', 'g/dL');
INSERT INTO ehr.lab_tests VALUES ('ALKP', 'Alkaline Phosphatase', 'IU/L');
INSERT INTO ehr.lab_tests VALUES ('APPEARANCE', 'Appearance', '');
INSERT INTO ehr.lab_tests VALUES ('B/C', 'BUN/Creatinine Ratio', 'ratio');
INSERT INTO ehr.lab_tests VALUES ('BANDS', 'Bands', '');
INSERT INTO ehr.lab_tests VALUES ('BD', 'Bands??', '%');
INSERT INTO ehr.lab_tests VALUES ('BD-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('BILIRUBIN', 'Bilirubin', 'no units');
INSERT INTO ehr.lab_tests VALUES ('BLOOD', 'Blood', 'no units');
INSERT INTO ehr.lab_tests VALUES ('BS', 'Basophils', '%');
INSERT INTO ehr.lab_tests VALUES ('BS-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('BUN', 'Blood urea nitrogen', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('CA', 'Calcium', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('CD20', 'CD20', '');
INSERT INTO ehr.lab_tests VALUES ('CD3', 'CD3', '');
INSERT INTO ehr.lab_tests VALUES ('CD4', 'CD4', '');
INSERT INTO ehr.lab_tests VALUES ('CD8', 'CD8', '');
INSERT INTO ehr.lab_tests VALUES ('CHOL', 'Cholesterol', 'mg/dl');
INSERT INTO ehr.lab_tests VALUES ('CL', 'Chloride', 'mEq/L');
INSERT INTO ehr.lab_tests VALUES ('CPK', 'Creatine phosphokinase', 'U/L');
INSERT INTO ehr.lab_tests VALUES ('CREAT', 'Creatinine', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('EO', 'Eosinophils', '%');
INSERT INTO ehr.lab_tests VALUES ('EO-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('FE', 'Iron', '?g/dL');
INSERT INTO ehr.lab_tests VALUES ('FIBR', 'Fibrinogen', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('GGT', 'Gamma-glutamyltransferase', 'IU/L');
INSERT INTO ehr.lab_tests VALUES ('GLOB', 'Globulin', 'g/dL');
INSERT INTO ehr.lab_tests VALUES ('GLUC', 'Glucose', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('GLYCOSYLATED HGB', 'GLYCOSYLATED HGB', '');
INSERT INTO ehr.lab_tests VALUES ('HCT', 'Hematocrit', '%');
INSERT INTO ehr.lab_tests VALUES ('HDL', 'High-Density Lipoprotein', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('HGB', 'Hemoglobin', 'g/dL');
INSERT INTO ehr.lab_tests VALUES ('K', 'Potassium', 'mmol/L');
INSERT INTO ehr.lab_tests VALUES ('KETONE', 'Ketone', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('LDH', 'Lactate dehydrogenase', 'IU/L');
INSERT INTO ehr.lab_tests VALUES ('LDL', 'Low-Density Lipoprotein', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('LEUKOCYTES', 'Leukocytes', 'no units');
INSERT INTO ehr.lab_tests VALUES ('LY', 'Lymphocytes', '%');
INSERT INTO ehr.lab_tests VALUES ('LY-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('MCH', 'Mean corpuscular hemoglobin', 'picograms');
INSERT INTO ehr.lab_tests VALUES ('MCHC', 'Mean corpuscular hemoglobin concentration', 'g/dL');
INSERT INTO ehr.lab_tests VALUES ('MCV', 'Mean corpuscular volume', 'fL');
INSERT INTO ehr.lab_tests VALUES ('METAMYELO', 'Metamyelocytes', '%');
INSERT INTO ehr.lab_tests VALUES ('MICROSCOPIC', 'Microscopic', '');
INSERT INTO ehr.lab_tests VALUES ('MN', 'Monocytes', '%');
INSERT INTO ehr.lab_tests VALUES ('MN-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('MPV', 'Mean platelet volume', 'fl');
INSERT INTO ehr.lab_tests VALUES ('MYELO', 'Myelocytes', '%');
INSERT INTO ehr.lab_tests VALUES ('NA', 'Sodium', 'mmol/L');
INSERT INTO ehr.lab_tests VALUES ('NE', 'Neutrophils', '%');
INSERT INTO ehr.lab_tests VALUES ('NE-AB', 'AB = absolute count??', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('NITRITE', 'Nitrite', 'no units');
INSERT INTO ehr.lab_tests VALUES ('PCV', 'Packed cell volume', '%');
INSERT INTO ehr.lab_tests VALUES ('PH', 'pH', 'no units');
INSERT INTO ehr.lab_tests VALUES ('PHOS', 'Phosphorus', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('PLT', 'Platelets', 'ths/uL');
INSERT INTO ehr.lab_tests VALUES ('PROTEIN', 'Protein', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('RBC', 'Red Blood Cells', '10^6/uL');
INSERT INTO ehr.lab_tests VALUES ('RDW', 'Red blood cell distribution width', '%');
INSERT INTO ehr.lab_tests VALUES ('RETICULO', 'Reticulocytes', '%');
INSERT INTO ehr.lab_tests VALUES ('SGOT', 'Serum glutamic oxaloacetic transaminase', 'IU/L');
INSERT INTO ehr.lab_tests VALUES ('SGPT', 'Serum glutamic pyruvic transaminase', 'IU/L');
INSERT INTO ehr.lab_tests VALUES ('SP_GRAVITY', 'Specific Gravity', 'no units');
INSERT INTO ehr.lab_tests VALUES ('TB', 'Total Bilirubin', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('TP', 'Total Protein', 'g/dL');
INSERT INTO ehr.lab_tests VALUES ('TRIG', 'Triglyceride', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('UA', 'Uric Acid', 'mg/dL');
INSERT INTO ehr.lab_tests VALUES ('UROBILINOGEN', 'Urobilinogen', 'E.U./dL');
INSERT INTO ehr.lab_tests VALUES ('WBC', 'White Blood Cells', 'ths/uL');