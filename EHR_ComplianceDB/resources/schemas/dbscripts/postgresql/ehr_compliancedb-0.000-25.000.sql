/*
 * Copyright (c) 2012-2026 LabKey Corporation
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

ALTER TABLE ehr_compliancedb.requirements DROP container;

ALTER TABLE ehr_compliancedb.CompletionDates ADD trainer varchar(100);

ALTER TABLE ehr_compliancedb.employees ADD middleName varchar(100);

ALTER TABLE ehr_compliancedb.employees ADD contactsSla bool default false;
ALTER TABLE ehr_compliancedb.requirements ADD contactsSla bool;

ALTER TABLE ehr_compliancedb.requirements ADD container entityid;

--upgrade of sorts.  both wnprc/onprc should have a single container, so set container based on employees
UPDATE ehr_compliancedb.requirements SET container = (SELECT max(cast(c.container as varchar(38))) as container from ehr_compliancedb.employees c);

--delete potential orphans
DELETE FROM ehr_compliancedb.requirements WHERE container IS NULL OR (select entityid FROM core.containers WHERE entityid = container) IS NULL;

ALTER TABLE ehr_compliancedb.requirements ADD rowid serial;

-- refactor foreign keys back into trigger scripts / java code.  this was done b/c
-- some tables are now scoped to a container, like requirements, and it is simply easier to enforce them from triggers than DB FKs
ALTER TABLE ehr_compliancedb.completiondates DROP CONSTRAINT fk_completiondates_employeeid;
ALTER TABLE ehr_compliancedb.employeerequirementexemptions DROP CONSTRAINT fk_employeerequirementexemptions_employeeid;
ALTER TABLE ehr_compliancedb.completiondates DROP CONSTRAINT fk_completiondates_requirementname;
ALTER TABLE ehr_compliancedb.employeerequirementexemptions DROP CONSTRAINT fk_employeerequirementexemptions_requirementname;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_type;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_category;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_title;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_unit;
ALTER TABLE ehr_compliancedb.employees DROP CONSTRAINT fk_employees_location;
ALTER TABLE ehr_compliancedb.requirements DROP CONSTRAINT fk_requirements_type;
ALTER TABLE ehr_compliancedb.requirementspercategory DROP CONSTRAINT fk_requirementspercategory_requirementname;
ALTER TABLE ehr_compliancedb.requirementspercategory DROP CONSTRAINT fk_requirementspercategory_category;
ALTER TABLE ehr_compliancedb.requirementspercategory DROP CONSTRAINT fk_requirementspercategory_unit;
ALTER TABLE ehr_compliancedb.requirementsperemployee DROP CONSTRAINT fk_requirementsperemployee_employeeid;
ALTER TABLE ehr_compliancedb.requirementsperemployee DROP CONSTRAINT fk_requirementsperemployee_requirementname;
ALTER TABLE ehr_compliancedb.sopbycategory DROP CONSTRAINT fk_sopbycategory_category;
ALTER TABLE ehr_compliancedb.sopdates DROP CONSTRAINT fk_sopdates_employeeid;

ALTER TABLE ehr_compliancedb.requirements DROP CONSTRAINT IF EXISTS PK_requirements;
ALTER TABLE ehr_compliancedb.requirements ADD CONSTRAINT pk_requirements PRIMARY KEY (rowid);

ALTER TABLE ehr_compliancedb.requirements ADD datedisabled TIMESTAMP;

ALTER TABLE ehr_compliancedb.employeerequirementexemptions ADD COLUMN Comments varchar(500);

CREATE INDEX IX_completiondates_employeeid ON ehr_compliancedb.completiondates(employeeid);
CREATE INDEX IX_completiondates_requirementname ON ehr_compliancedb.completiondates(requirementname);

CREATE INDEX IX_employeerequirementexemptions_employeeid ON ehr_compliancedb.employeerequirementexemptions(employeeid);
CREATE INDEX IX_employeerequirementexemptions_requirementname ON ehr_compliancedb.employeerequirementexemptions(requirementname);

CREATE INDEX IX_requirementspercategory_requirementname ON ehr_compliancedb.requirementspercategory(requirementname);

CREATE INDEX IX_requirementsperemployee_requirementname ON ehr_compliancedb.requirementsperemployee(requirementname);
CREATE INDEX IX_requirementsperemployee_employeeid ON ehr_compliancedb.requirementsperemployee(employeeid);

CREATE INDEX IX_sopdates_employeeid ON ehr_compliancedb.sopdates(employeeid);

ALTER TABLE ehr_compliancedb.CompletionDates ADD COLUMN FileName varchar(500);

ALTER TABLE ehr_compliancedb.Employees ALTER COLUMN Notes TYPE VARCHAR (4000);

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add COLUMN trackingflag varchar(100);

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add COLUMN objectid ENTITYID;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add COLUMN taskid ENTITYID;

CREATE TABLE ehr_compliancedb.EmployeePerUnit
(
    RowId SERIAL NOT NULL,
    EmployeeId varchar(255) not null,
    unit varchar(255) null,
    category varchar(255) null,
    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created timestamp,
    ModifiedBy USERID,
    Modified timestamp,
    taskid entityid,
    objectid entityid,

    CONSTRAINT PK_EmployeePerUnits PRIMARY KEY (RowId)
);

ALTER TABLE ehr_compliancedb.Requirements add reviewdate TIMESTAMP;

CREATE TABLE ehr_compliancedb.Compliance_Reference_Data
(
        rowId SERIAL,
        label varchar(250) NULL,
        value varchar(255),
        columnName varchar(255) NOT NULL,
        sort_order integer NULL,
        endDate TIMESTAMP NULL,
        objectid entityid,

        CONSTRAINT pk_compliance_reference PRIMARY KEY (value)
);

ALTER TABLE ehr_compliancedb.CompletionDates ADD snooze_date TIMESTAMP;