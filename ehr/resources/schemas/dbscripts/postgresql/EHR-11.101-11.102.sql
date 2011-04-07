/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr.qcPermissionMap;


DROP TABLE IF EXISTS ehr.module_properties;
CREATE TABLE ehr.module_properties (
    RowId SERIAL NOT NULL,

    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_module_properties PRIMARY KEY (RowId),
    CONSTRAINT UNIQUE_module_properties UNIQUE (prop_name, container)
);

DROP TABLE IF EXISTS ehr.site_module_properties;
CREATE TABLE ehr.site_module_properties (
    prop_name varchar(255) DEFAULT NULL,
    stringvalue varchar(255) DEFAULT NULL,
    floatvalue float DEFAULT NULL,

    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_site_module_properties PRIMARY KEY (prop_name)
);

-- ----------------------------
-- Table structure for ehr.reports
-- ----------------------------
DROP TABLE IF EXISTS ehr.reports;
CREATE TABLE ehr.reports (
rowid serial not null,
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
QueryHasLocation bool DEFAULT NULL,
--added
QCStatePublicDataFieldName varchar(255) default null,

Container ENTITYID NOT NULL,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_reports PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;