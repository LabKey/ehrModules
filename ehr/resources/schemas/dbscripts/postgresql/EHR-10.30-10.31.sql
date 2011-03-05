/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT core.fn_dropifexists('*', 'ehr', 'SCHEMA', NULL);

CREATE SCHEMA ehr;

CREATE OR REPLACE FUNCTION ehr.uuid()
 RETURNS uuid AS
$BODY$
 SELECT CAST(md5(current_database()|| user ||current_timestamp
||random()) as uuid)
$BODY$
 LANGUAGE 'sql' VOLATILE
;


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

    CONSTRAINT PK_module_properties PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr.snomed_tags;
CREATE TABLE ehr.snomed_tags
(
    RowId SERIAL NOT NULL,
    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    recordId character varying(200),
    code character varying(32),

    CONSTRAINT PK_snomed_tags PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr.tasks;
CREATE TABLE ehr.tasks
(
    TaskId ENTITYID NOT NULL,
    RowId SERIAL NOT NULL,
    category varchar(200) not null,
    title varchar(4000),
    FormType character varying(200),
    QCState integer,
    AssignedTo USERID,
    DueDate TIMESTAMP,
    RequestId ENTITYID,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    Description TEXT,

    CONSTRAINT PK_tasks PRIMARY KEY (TaskId)

);


DROP TABLE IF EXISTS ehr.requests;
CREATE TABLE ehr.requests
(
    RequestId ENTITYID NOT NULL,
    RowId SERIAL NOT NULL,
    --DueDate TIMESTAMP,
    title varchar(4000),
    FormType character varying(200),

    priority varchar(200),
    notify1 integer,
    notify2 varchar(200),
    pi varchar(200),
    QCState integer,
    Description text,
    daterequested timestamp,
    enddate timestamp,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_requests PRIMARY KEY (RequestId)
);


DROP TABLE IF EXISTS ehr.cage_observations;
CREATE TABLE ehr.cage_observations
(
    RowId serial NOT NULL,

    date TIMESTAMP not null,
    Roomcage character varying(100),
    room character varying(100),
    cage character varying(100),
    remark TEXT,
    userid character varying(100),
    ObjectId ENTITYID,

    taskid ENTITYID,
    parentid ENTITYID,
    QCState integer,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    Description TEXT,

    CONSTRAINT PK_cage_observations PRIMARY KEY (RowId)

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

Container ENTITYID NOT NULL,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_reports PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;

DROP TABLE IF EXISTS ehr.extracts;
CREATE TABLE ehr.extracts
(
    RowId serial NOT NULL,
    queryName character varying(100),
    schemaName character varying(100),
    containerPath character varying(100),
    viewName character varying(100),
    fileName character varying(100),
    columns character varying(500),
    fieldsToHash character varying(500),

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_extracts PRIMARY KEY (RowId)

);


DROP TABLE IF EXISTS ehr.formTemplates;
CREATE TABLE ehr.formTemplates
(
    entityId ENTITYID not null,
    Title varchar(4000) not null,
    formType varchar(4000) not null,
    template varchar(4000),
    userId integer default null,
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTemplates PRIMARY KEY (entityId),
    CONSTRAINT UNIQUE_formTemplates UNIQUE (formtype, title)
);


DROP TABLE IF EXISTS ehr.formTemplateRecords;
CREATE TABLE ehr.formTemplateRecords
(
    RowId serial NOT NULL,
    TemplateId ENTITYID not null,
    StoreId varchar(4000) not null,
    json text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTemplateRecords PRIMARY KEY (RowId)
);


DROP TABLE IF EXISTS ehr.formTypes;
CREATE TABLE ehr.formTypes
(
    formType varchar(4000) NOT NULL,
    category varchar (100),
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTypes PRIMARY KEY (formType)
);


DROP TABLE IF EXISTS ehr.formPanelSections;
CREATE TABLE ehr.formPanelSections
(
    RowId serial NOT NULL,
    formType varchar(4000) not null,
    Destination varchar(4000) not null,
    sort_order int4,
    xtype varchar(200) not null,
    schemaName varchar(200),
    queryName varchar(200),
    title varchar(4000),
    metadataSources varchar(4000),
    buttons varchar(4000),
    initialTemplates varchar(4000),
    configJson text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formPanelSections PRIMARY KEY (RowId)
);

-- DROP TABLE IF EXISTS ehr.taskPanelSectionMapping;
-- CREATE TABLE ehr.taskPanelSectionMapping
-- (
--     RowId serial NOT NULL,
--     FormType varchar(4000) not null,
--     SectionId int4,
--     Destination varchar(4000) not null,
--     sort_order int4,
--
--     Container ENTITYID NOT NULL,
--     CreatedBy USERID NOT NULL,
--     Created TIMESTAMP NOT NULL,
--     ModifiedBy USERID NOT NULL,
--     Modified TIMESTAMP NOT NULL,
--
--      CONSTRAINT PK_taskPanelSectionMapping PRIMARY KEY (RowId)
-- );


DROP TABLE IF EXISTS ehr.notificationTypes;
CREATE TABLE ehr.notificationTypes
(
    NotificationType varchar(4000) NOT NULL,
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_notificationTypes PRIMARY KEY (NotificationType)
);


DROP TABLE IF EXISTS ehr.notificationRecipients;
CREATE TABLE ehr.notificationRecipients
(
    RowId serial NOT NULL,
    NotificationType varchar(4000),
    Recipient varchar(4000) not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_notificationRecipients PRIMARY KEY (RowId)
);


--/////////////////////////////////////

DROP TABLE IF EXISTS ehr.protocols;
CREATE TABLE ehr.protocols
(
    protocol varchar(4000) NOT NULL,
    inves varchar(200),
    approve TIMESTAMP,
    description text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocol PRIMARY KEY (protocol)
);

DROP TABLE IF EXISTS ehr.protocol_counts;
CREATE TABLE ehr.protocol_counts
(
    rowId serial not null,
    protocol varchar(4000) NOT NULL,
    species varchar (200) not null,
    allowed integer not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocol_counts PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr.project;
CREATE TABLE ehr.project
(
    project varchar (200) not null,
    protocol varchar(200) NOT NULL,
    account varchar(200),
    inves varchar(4000),
    avail varchar(100),
    title varchar(4000),
    research boolean,
    reqname varchar(4000),
    requestId varchar(100),
    QCState integer,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_project PRIMARY KEY (project)
);

-- DROP TABLE IF EXISTS ehr.error_reports;
-- CREATE TABLE ehr.error_reports
-- (
--     id varchar (4000) not null,
--     protocol varchar(200) NOT NULL,
--     account varchar(200),
--     inves varchar(4000),
--     avail varchar(100),
--     title varchar(4000),
--     research boolean,
--     reqname varchar(4000),
--     requestId varchar(100),
--     QCState integer,
--
--     Container ENTITYID NOT NULL,
--     CreatedBy USERID NOT NULL,
--     Created TIMESTAMP NOT NULL,
--     ModifiedBy USERID NOT NULL,
--     Modified TIMESTAMP NOT NULL,
--
--     CONSTRAINT PK_project PRIMARY KEY (project)
-- );



DROP TABLE IF EXISTS ehr.client_errors;
CREATE TABLE ehr.client_errors
(
    rowid serial not null,
    page varchar(4000),
    exception varchar(4000),
    json text,

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_client_errors PRIMARY KEY (rowid)
);