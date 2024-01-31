

CREATE TABLE ehr_compliancedb.SciShield_Data
(
    RowId INT IDENTITY(1,1) NOT NULL,
    employeeId nvarchar(255) not null,
    requirementname nvarchar(255) null,
    Date datetime null,
    Container ENTITYID NOT NULL,
    comment nvarchar(2000) null
    CreatedBy USERID,
    Created datetime,
    ModifiedBy USERID,
    Modified datetime,
    processed int NULL


        CONSTRAINT PK_ScieShield_Data PRIMARY KEY (RowId)
    );
GO

CREATE TABLE ehr_compliancedb.SciShield_Reference_Data
(
    rowId int identity(1,1),
    label nvarchar(250) NULL,
    value nvarchar(255) NOT NULL ,
    columnName nvarchar(255)  NOT NULL,
    sort_order integer  null,
    endDate  datetime  NULL


        CONSTRAINT pk_SciShield_reference PRIMARY KEY (value)

);
GO
