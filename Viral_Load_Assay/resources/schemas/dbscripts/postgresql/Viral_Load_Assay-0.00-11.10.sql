/*
 * Copyright (c) 2011-2012 LabKey Corporation
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

CREATE SCHEMA Viral_Load_Assay;

CREATE TABLE Viral_Load_Assay.assays
(
    AssayName VARCHAR(255) NOT NULL,
    Virus VARCHAR(255) not null,
    ForwardPrimer VARCHAR(4000),
    ReversePrimer VARCHAR(4000),

    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_assays PRIMARY KEY (assayName)
);

-- ----------------------------
-- Records of assays
-- ----------------------------
INSERT INTO Viral_Load_Assay.assays
(assayName, virus)
VALUES
('SIVmac239-Gag', 'SIVmac239');

-- ----------------------------
-- Table structure for vl_category
-- ----------------------------
CREATE TABLE Viral_Load_Assay.vl_category
(
    Category VARCHAR(255) NOT NULL,

    CONSTRAINT PK_vl_category PRIMARY KEY (category)
)
WITH (OIDS=FALSE);

-- ----------------------------
-- Records of vl_category
-- ----------------------------
INSERT INTO Viral_Load_Assay.vl_category VALUES ('CTL');
INSERT INTO Viral_Load_Assay.vl_category VALUES ('Sample');
INSERT INTO Viral_Load_Assay.vl_category VALUES ('STD');

-- ----------------------------
-- Table structure for vl_instrument
-- ----------------------------
CREATE TABLE Viral_Load_Assay.vl_instrument
(
    Instrument VARCHAR(255) NOT NULL,

    CONSTRAINT PK_vl_instrument PRIMARY KEY (instrument)
)
WITH (OIDS=FALSE);

-- ----------------------------
-- Records of vl_instrument
-- ----------------------------
INSERT INTO Viral_Load_Assay.vl_instrument VALUES ('LC480');
INSERT INTO Viral_Load_Assay.vl_instrument VALUES ('Light Cycler');

-- ----------------------------
-- Table structure for vl_sampletype
-- ----------------------------
CREATE TABLE Viral_Load_Assay.vl_sampletype
(
    Sample_type VARCHAR(255) NOT NULL,

    CONSTRAINT PK_vl_sampletype PRIMARY KEY (sample_type)
)
WITH (OIDS=FALSE);

-- ----------------------------
-- Records of vl_sampletype
-- ----------------------------
INSERT INTO Viral_Load_Assay.vl_sampletype VALUES ('gDNA');
INSERT INTO Viral_Load_Assay.vl_sampletype VALUES ('vRNA');

-- ----------------------------
-- Table structure for vl_technique
-- ----------------------------
CREATE TABLE Viral_Load_Assay.vl_technique
(
    Technique VARCHAR(255) NOT NULL,

    CONSTRAINT PK_vl_technique PRIMARY KEY (Technique)
)
WITH (OIDS=FALSE);

-- ----------------------------
-- Records of vl_technique
-- ----------------------------
INSERT INTO Viral_Load_Assay.vl_technique VALUES ('Lifson 1-Step VL');

-- ----------------------------
-- Table structure for vl_virus
-- ----------------------------
CREATE TABLE Viral_Load_Assay.vl_virus
(
    Virus VARCHAR(255) NOT NULL,

    CONSTRAINT PK_vl_virus PRIMARY KEY (virus)
)
WITH (OIDS=FALSE);

-- ----------------------------
-- Records of vl_virus
-- ----------------------------
INSERT INTO Viral_Load_Assay.vl_virus VALUES ('SIVmac239');


