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

DROP TABLE IF EXISTS Viral_Load_Assay.challenge_dates;
CREATE TABLE Viral_Load_Assay.challenge_dates
(
rowid serial not null,
subjectname varchar(255),
date timestamp,
agent varchar(255),
isvaccination boolean,

container entityid,
CreatedBy USERID,
Created TIMESTAMP,
ModifiedBy USERID,
Modified TIMESTAMP,

CONSTRAINT PK_challenge_dates PRIMARY KEY (rowid)
)
;

/* Viral_Load_Assay-11.11-11.12.sql */

-- ----------------------------
-- Table structure for viral_load_assay.module_properties
-- ----------------------------
DROP TABLE IF EXISTS viral_load_assay.module_properties;
CREATE TABLE viral_load_assay.module_properties (
    RowId SERIAL NOT NULL,

    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_module_properties PRIMARY KEY (rowId)
);

-- ----------------------------
-- Table structure for viral_load_assay.site_module_properties
-- ----------------------------
DROP TABLE IF EXISTS viral_load_assay.site_module_properties;
CREATE TABLE viral_load_assay.site_module_properties (
    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_site_module_properties PRIMARY KEY (prop_name)
)
;