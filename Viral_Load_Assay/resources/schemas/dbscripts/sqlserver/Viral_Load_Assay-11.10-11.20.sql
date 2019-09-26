/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Viral_Load_Assay-11.10-11.11.sql */

/* viral_load_assay-0.00-11.10.sql */

EXEC core.fn_dropifexists '*', 'viral_load_assay', 'SCHEMA', NULL
GO
CREATE SCHEMA viral_load_assay;
go

EXEC core.fn_dropifexists 'assays', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.assays
(
assayName varchar(255) NOT NULL,
virus varchar(255) not null,
forwardPrimer varchar(4000),
reversePrimer varchar(4000),

CreatedBy USERID,
Created datetime,
ModifiedBy USERID,
Modified datetime,

CONSTRAINT PK_assays PRIMARY KEY (assayName)
)
;

-- ----------------------------
-- Records of assays
-- ----------------------------
INSERT INTO viral_load_assay.assays
(assayName, virus)
VALUES
('SIVmac239-Gag', 'SIVmac239');



-- ----------------------------
-- Table structure for vl_category
-- ----------------------------
EXEC core.fn_dropifexists 'assays', 'vl_category', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.vl_category (
category varchar(255) NOT NULL,

CONSTRAINT PK_vl_category PRIMARY KEY (category)
)
;

-- ----------------------------
-- Records of vl_category
-- ----------------------------
INSERT INTO viral_load_assay.vl_category VALUES ('CTL');
INSERT INTO viral_load_assay.vl_category VALUES ('Sample');
INSERT INTO viral_load_assay.vl_category VALUES ('STD');

-- ----------------------------
-- Table structure for vl_instrument
-- ----------------------------
EXEC core.fn_dropifexists 'vl_instrument', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.vl_instrument (
instrument varchar(255) NOT NULL,

CONSTRAINT PK_vl_instrument PRIMARY KEY (instrument)
)
;

-- ----------------------------
-- Records of vl_instrument
-- ----------------------------
INSERT INTO viral_load_assay.vl_instrument VALUES ('LC480');
INSERT INTO viral_load_assay.vl_instrument VALUES ('Light Cycler');

-- ----------------------------
-- Table structure for vl_sampletype
-- ----------------------------
EXEC core.fn_dropifexists 'vl_sampletype', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.vl_sampletype (
sample_type varchar(255) NOT NULL,

CONSTRAINT PK_vl_sampletype PRIMARY KEY (sample_type)
)
;

-- ----------------------------
-- Records of vl_sampletype
-- ----------------------------
INSERT INTO viral_load_assay.vl_sampletype VALUES ('gDNA');
INSERT INTO viral_load_assay.vl_sampletype VALUES ('vRNA');

-- ----------------------------
-- Table structure for vl_technique
-- ----------------------------
EXEC core.fn_dropifexists 'vl_technique', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.vl_technique (
technique varchar(255) NOT NULL,

CONSTRAINT PK_vl_technique PRIMARY KEY (technique)
)
;

-- ----------------------------
-- Records of vl_technique
-- ----------------------------
INSERT INTO viral_load_assay.vl_technique VALUES ('Lifson 1-Step VL');

-- ----------------------------
-- Table structure for vl_virus
-- ----------------------------
EXEC core.fn_dropifexists 'vl_virus', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.vl_virus (
virus varchar(255) NOT NULL,

CONSTRAINT PK_vl_virus PRIMARY KEY (virus)
)
;

-- ----------------------------
-- Records of vl_virus
-- ----------------------------
INSERT INTO viral_load_assay.vl_virus VALUES ('SIVmac239');

/* viral_load_assay-11.10-11.11.sql */

EXEC core.fn_dropifexists 'challenge_dates', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.challenge_dates
(
rowid INT IDENTITY(1,1) not null,
subjectname varchar(255),
date datetime,
agent varchar(255),
isvaccination bit,

container entityid,
CreatedBy USERID,
Created datetime,
ModifiedBy USERID,
Modified datetime,

CONSTRAINT PK_challenge_dates PRIMARY KEY (rowid)
)
;

/* Viral_Load_Assay-11.11-11.12.sql */

-- ----------------------------
-- Table structure for viral_load_assay.module_properties
-- ----------------------------
EXEC core.fn_dropifexists 'module_properties', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.module_properties (
    RowId INT IDENTITY(1,1) NOT NULL,

    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created datetime,
    ModifiedBy USERID,
    Modified datetime,

    CONSTRAINT PK_module_properties PRIMARY KEY (rowId)
);

-- ----------------------------
-- Table structure for viral_load_assay.site_module_properties
-- ----------------------------
EXEC core.fn_dropifexists 'site_module_properties', 'viral_load_assay', 'TABLE', NULL
GO
CREATE TABLE viral_load_assay.site_module_properties (
    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    CreatedBy USERID,
    Created datetime,
    ModifiedBy USERID,
    Modified datetime,

    CONSTRAINT PK_site_module_properties PRIMARY KEY (prop_name)
)
;