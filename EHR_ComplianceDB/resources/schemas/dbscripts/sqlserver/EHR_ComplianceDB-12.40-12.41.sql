
ALTER TABLE ehr_compliancedb.RequirementsPerCategory add trackingflag nvarchar(100);

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add objectid ENTITYID;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add taskid ENTITYID;


CREATE TABLE ehr_compliancedb.EmployeePerUnit
(
    RowId INT IDENTITY(1,1) NOT NULL,
    EmployeeId nvarchar(255) not null,
    unit nvarchar(255) null,
    category nvarchar(255) null,
    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created datetime,
    ModifiedBy USERID,
    Modified datetime,
    taskid entityid,
    objectid entityid

        CONSTRAINT PK_EmployeePerUnits PRIMARY KEY (RowId)
);
