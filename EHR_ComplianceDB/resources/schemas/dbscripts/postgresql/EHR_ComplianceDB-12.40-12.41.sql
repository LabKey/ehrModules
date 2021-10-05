
ALTER TABLE ehr_compliancedb.RequirementsPerCategory add trackingflag nvarchar(100);
GO

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add objectid ENTITYID;
GO

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add taskid ENTITYID;
GO

CREATE TABLE ehr_compliancedb.EmployeePerUnit
(
    RowId INT IDENTITY(1,1) NOT NULL,
    EmployeeId varchar(255) not null,
    unit nvarchar(255) null,
    category nvarchar(255) null,
    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created timestamp,
    ModifiedBy USERID,
    Modified timestamp,
    taskid entityid,
    objectid entityid

        CONSTRAINT PK_EmployeePerUnits PRIMARY KEY (RowId)
);
GO