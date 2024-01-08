CREATE TABLE ehr_compliancedb.EmployeeTraining
(
    rowId INT IDENTITY(100,1) NOT NULL,
    EmployeeId nvarchar(255) not null,
    [requirementname] [nvarchar](3000) NULL,
    [datecompleted] [datetime] NULL,
    [next_training] [nvarchar](50) NULL,
    [next_training_date] [datetime] NULL,
    [required_training] [nchar](10) NULL,
    [objectid] [dbo].[ENTITYID] NULL,
    [comments] [char](500) NULL,
    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created datetime,
    ModifiedBy USERID,
    Modified datetime,
    taskid entityid,
    unit nvarchar(1000),
    category nvarchar(1000)



        CONSTRAINT PK_EmployeeTraining PRIMARY KEY (rowId)
);