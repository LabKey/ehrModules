/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT core.fn_dropifexists('*', 'ehr_compliancedb', 'SCHEMA', NULL);

CREATE SCHEMA ehr_compliancedb;


DROP TABLE IF EXISTS ehr_compliancedb.CompletionDates;
CREATE TABLE ehr_compliancedb.CompletionDates (
    RowId SERIAL NOT NULL PRIMARY KEY,
    EmployeeId varchar(255) not null,
    RequirementName varchar(255) not null,
    Date timestamp,
    result varchar(500),
    comment varchar(4000)
);


DROP TABLE IF EXISTS ehr_compliancedb.EmployeeCategory;
CREATE TABLE ehr_compliancedb.EmployeeCategory (
    CategoryName varchar(255) PRIMARY KEY
);

DROP TABLE IF EXISTS ehr_compliancedb.RequirementsPerEmployee;
CREATE TABLE ehr_compliancedb.RequirementsPerEmployee (
    RowId SERIAL NOT NULL PRIMARY KEY,
    EmployeeId varchar(255) not null,
    RequirementName varchar(255) not null
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeRequirementExemptions;
CREATE TABLE ehr_compliancedb.EmployeeRequirementExemptions (
    RowId SERIAL NOT NULL PRIMARY KEY,
    EmployeeId varchar(255) not null,
    RequirementName varchar(255) not null
);

DROP TABLE IF EXISTS ehr_compliancedb.Employees;
CREATE TABLE ehr_compliancedb.Employees (
    EmployeeId varchar(255) not null PRIMARY KEY,
    LastName varchar(255) not null,
    FirstName varchar(255),
    Email varchar(255),
    Email2 varchar(255),
    PersonId int4,
    Type varchar(255),
    MajorUDDS varchar(255),
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
    isWNPRC boolean
);

DROP TABLE IF EXISTS ehr_compliancedb.RequirementsPerCategory;
CREATE TABLE ehr_compliancedb.RequirementsPerCategory (
    RowId SERIAL NOT NULL PRIMARY KEY,
    RequirementName varchar(255) not null,
    Category varchar(255) not null,
    Unit varchar(255) not null
);

DROP TABLE IF EXISTS ehr_compliancedb.Requirements;
CREATE TABLE ehr_compliancedb.Requirements (
    RequirementName varchar(255) not null PRIMARY KEY,
    Type varchar(255) not null,
    ExpirePeriod int4 not null,
    Required boolean,
    WNPRC_only boolean,
    Access boolean,
    Animals boolean,
    Tissues boolean
);

DROP TABLE IF EXISTS ehr_compliancedb.RequirementType;
CREATE TABLE ehr_compliancedb.RequirementType (
    Type varchar(255) not null PRIMARY KEY
);

DROP TABLE IF EXISTS ehr_compliancedb.SOPByCategory;
CREATE TABLE ehr_compliancedb.SOPByCategory (
    RowId SERIAL NOT NULL PRIMARY KEY,
    SOP_ID varchar(255) not null,
    Category varchar(255) not null
);

DROP TABLE IF EXISTS ehr_compliancedb.SOPs;
CREATE TABLE ehr_compliancedb.SOPs (
    Id varchar(255) not null,
    Name varchar(255) not null,
    PDF bytea
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeLocations;
CREATE TABLE ehr_compliancedb.EmployeeLocations (
    location varchar(255) not null PRIMARY KEY
);

DROP TABLE IF EXISTS ehr_compliancedb.EmployeeTypes;
CREATE TABLE ehr_compliancedb.EmployeeTypes (
    type varchar(255) not null PRIMARY KEY
);

DROP TABLE IF EXISTS ehr_compliancedb.WNPRC_Units;
CREATE TABLE ehr_compliancedb.WNPRC_Units (
    unit varchar(255) not null PRIMARY KEY
);

