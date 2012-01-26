/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT core.fn_dropifexists('*', 'ehr_compliancedb', 'SCHEMA', NULL);

CREATE SCHEMA ehr_compliancedb;


DROP TABLE IF EXISTS ehr_compliancedb.CompletionDates;
CREATE TABLE ehr_compliancedb.CompletionDates (
    RowId SERIAL NOT NULL,
    EmployeeId varchar(255) not null,
    RequirementName varchar(255) not null,
    Date timestamp,
    result varchar(500),
    comment varchar(4000),

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_CompletionDates PRIMARY KEY (rowid)
);


DROP TABLE IF EXISTS ehr_compliancedb.EmployeeCategory;
CREATE TABLE ehr_compliancedb.EmployeeCategory (
    CategoryName varchar(255),

    CONSTRAINT PK_EmployeeCategory PRIMARY KEY (CategoryName)
);

DROP TABLE IF EXISTS ehr_compliancedb.RequirementsPerEmployee;
CREATE TABLE ehr_compliancedb.RequirementsPerEmployee (
    RowId SERIAL NOT NULL,
    EmployeeId varchar(255) not null,
    RequirementName varchar(255) not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_RequirementsPerEmployee PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeRequirementExemptions;
CREATE TABLE ehr_compliancedb.EmployeeRequirementExemptions (
    RowId SERIAL NOT NULL,
    EmployeeId varchar(255) not null,
    RequirementName varchar(255) not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_EmployeeRequirementExemptions PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr_compliancedb.Employees;
CREATE TABLE ehr_compliancedb.Employees (
    EmployeeId varchar(255) not null,
    LastName varchar(255) not null,
    FirstName varchar(255),
    Email varchar(255),
    Email2 varchar(255),
    PersonId int4,
    Type varchar(255),
    MajorUDDS varchar(255),
    category varchar(255),
    Title varchar(255),
    Unit varchar(255),
    Supervisor varchar(255),
    EmergencyContact varchar(255),
    EmergencyContactDaytimePhone varchar(255),
    EmergencyContactNighttimePhone varchar(255),
    HomePhone varchar(255),
    OfficePhone varchar(255),
    CellPhone varchar(255),
    Location varchar(255),
    StartDate timestamp,
    EndDate timestamp,
    Notes varchar(255),
    barrier boolean,
    animals boolean,
    tissue boolean,
    isemployee boolean,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_Employees PRIMARY KEY (EmployeeId)
);

DROP TABLE IF EXISTS ehr_compliancedb.RequirementsPerCategory;
CREATE TABLE ehr_compliancedb.RequirementsPerCategory (
    RowId SERIAL NOT NULL,
    RequirementName varchar(255) not null,
    Category varchar(255),
    Unit varchar(255),

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_RequirementsPerCategory PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr_compliancedb.Requirements;
CREATE TABLE ehr_compliancedb.Requirements (
    RequirementName varchar(255) not null,
    Type varchar(255),
    ExpirePeriod integer,
    Required boolean,
    Access boolean,
    Animals boolean,
    Tissues boolean,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_Requirements PRIMARY KEY (RequirementName)
);

DROP TABLE IF EXISTS ehr_compliancedb.RequirementType;
CREATE TABLE ehr_compliancedb.RequirementType (
    Type varchar(255) not null,

    CONSTRAINT PK_RequirementType PRIMARY KEY (Type)
);

DROP TABLE IF EXISTS ehr_compliancedb.SOPByCategory;
CREATE TABLE ehr_compliancedb.SOPByCategory (
    RowId SERIAL NOT NULL,
    SOP_ID varchar(255) not null,
    Category varchar(255) not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_SOPByCategory PRIMARY KEY (RowId)
);

DROP TABLE IF EXISTS ehr_compliancedb.SOPs;
CREATE TABLE ehr_compliancedb.SOPs (
    SopId varchar(255) not null,
    Name varchar(255) not null,
    PDF integer,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_SOPs PRIMARY KEY (SopId)
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeLocations;
CREATE TABLE ehr_compliancedb.EmployeeLocations (
    location varchar(255) not null,

    CONSTRAINT PK_EmployeeLocations PRIMARY KEY (location)
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeTypes;
CREATE TABLE ehr_compliancedb.EmployeeTypes (
    type varchar(255) not null,

    CONSTRAINT PK_EmployeeTypes PRIMARY KEY (type)
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeTitles;
CREATE TABLE ehr_compliancedb.EmployeeTitles (
    title varchar(255) not null,

    CONSTRAINT PK_EmployeeTitles PRIMARY KEY (title)
);

DROP TABLE IF EXISTS ehr_compliancedb.unit_names;
CREATE TABLE ehr_compliancedb.unit_names (
    unit varchar(255) not null,
    supervisor varchar(255),
    phone varchar(255),
    address varchar(100),

    CONSTRAINT PK_unit_names PRIMARY KEY (unit)
);

DROP TABLE IF EXISTS ehr_compliancedb.SOPDates;
CREATE TABLE ehr_compliancedb.SOPDates (
    RowId SERIAL NOT NULL,
    EmployeeId varchar(255) not null,
    sopid varchar(255) not null,
    Date timestamp not null,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_SOPDates PRIMARY KEY (rowid)
);
