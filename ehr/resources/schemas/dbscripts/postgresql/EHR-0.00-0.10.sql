/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT core.fn_dropifexists('*', 'ehr', 'SCHEMA', NULL);

CREATE SCHEMA ehr;

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

CREATE TABLE ehr.requests
(
    RequestId SERIAL NOT NULL PRIMARY KEY,
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

