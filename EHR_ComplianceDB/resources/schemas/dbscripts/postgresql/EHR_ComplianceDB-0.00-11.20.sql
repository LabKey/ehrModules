/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
/* EHR_ComplianceDB-00.00-11.14.sql */

CREATE SCHEMA ehr_compliancedb;

CREATE TABLE ehr_compliancedb.CompletionDates
(
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

CREATE TABLE ehr_compliancedb.EmployeeCategory
(
    CategoryName varchar(255),

    CONSTRAINT PK_EmployeeCategory PRIMARY KEY (CategoryName)
);

CREATE TABLE ehr_compliancedb.RequirementsPerEmployee
(
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

CREATE TABLE ehr_compliancedb.EmployeeRequirementExemptions
(
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

CREATE TABLE ehr_compliancedb.Employees
(
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

CREATE TABLE ehr_compliancedb.RequirementsPerCategory
(
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

CREATE TABLE ehr_compliancedb.Requirements
(
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

CREATE TABLE ehr_compliancedb.RequirementType
(
    Type varchar(255) not null,

    CONSTRAINT PK_RequirementType PRIMARY KEY (Type)
);

CREATE TABLE ehr_compliancedb.SOPByCategory
(
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

CREATE TABLE ehr_compliancedb.SOPs
(
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

CREATE TABLE ehr_compliancedb.EmployeeLocations
(
    Location varchar(255) not null,

    CONSTRAINT PK_EmployeeLocations PRIMARY KEY (location)
);

CREATE TABLE ehr_compliancedb.EmployeeTypes
(
    Type varchar(255) not null,

    CONSTRAINT PK_EmployeeTypes PRIMARY KEY (type)
);

CREATE TABLE ehr_compliancedb.EmployeeTitles
(
    title varchar(255) not null,

    CONSTRAINT PK_EmployeeTitles PRIMARY KEY (title)
);

CREATE TABLE ehr_compliancedb.unit_names
(
    unit varchar(255) not null,
    supervisor varchar(255),
    phone varchar(255),
    address varchar(100),

    CONSTRAINT PK_unit_names PRIMARY KEY (unit)
);

CREATE TABLE ehr_compliancedb.SOPDates
(
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

/* EHR_ComplianceDB-11.15-11.16.sql */

ALTER TABLE ehr_compliancedb.completiondates
  ADD CONSTRAINT fk_completiondates_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.completiondates
  ADD CONSTRAINT fk_completiondates_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employeerequirementexemptions
  ADD CONSTRAINT fk_employeerequirementexemptions_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employeerequirementexemptions
  ADD CONSTRAINT fk_employeerequirementexemptions_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_type FOREIGN KEY (type)
      REFERENCES ehr_compliancedb.employeetypes (type)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_category FOREIGN KEY (category)
      REFERENCES ehr_compliancedb.employeecategory (categoryname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_title FOREIGN KEY (title)
      REFERENCES ehr_compliancedb.employeetitles (title)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_unit FOREIGN KEY (unit)
      REFERENCES ehr_compliancedb.unit_names (unit)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.employees
  ADD CONSTRAINT fk_employees_location FOREIGN KEY (location)
      REFERENCES ehr_compliancedb.employeelocations (location)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirements
  ADD CONSTRAINT fk_requirements_type FOREIGN KEY (type)
      REFERENCES ehr_compliancedb.requirementtype (type)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementspercategory
  ADD CONSTRAINT fk_requirementspercategory_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementspercategory
  ADD CONSTRAINT fk_requirementspercategory_category FOREIGN KEY (category)
      REFERENCES ehr_compliancedb.employeecategory (categoryname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementspercategory
  ADD CONSTRAINT fk_requirementspercategory_unit FOREIGN KEY (unit)
      REFERENCES ehr_compliancedb.unit_names (unit)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementsperemployee
  ADD CONSTRAINT fk_requirementsperemployee_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.requirementsperemployee
  ADD CONSTRAINT fk_requirementsperemployee_requirementname FOREIGN KEY (requirementname)
      REFERENCES ehr_compliancedb.requirements (requirementname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.sopbycategory
  ADD CONSTRAINT fk_sopbycategory_category FOREIGN KEY (category)
      REFERENCES ehr_compliancedb.employeecategory (categoryname)
      ON UPDATE CASCADE;

ALTER TABLE ehr_compliancedb.sopdates
  ADD CONSTRAINT fk_sopdates_employeeid FOREIGN KEY (employeeid)
      REFERENCES ehr_compliancedb.employees (employeeid)
      ON UPDATE CASCADE;