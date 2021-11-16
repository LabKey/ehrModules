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
