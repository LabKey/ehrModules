

CREATE TABLE ehr_compliancedb.SciShield_Data
(
    RowId SERIAL NOT NULL,
    employeeId varchar(255) not null,
    requirementname varchar(255) null,
    Date  TIMESTAMP null,
    Container ENTITYID NOT NULL,
    comment varchar(2000) null,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,
    processed int NULL


        CONSTRAINT PK_ScieShield_Data PRIMARY KEY (RowId)
    );


CREATE TABLE ehr_compliancedb.SciShield_Reference_Data
(
    RowId SERIAL NOT NULL,
    label varchar(250) NULL,
    value varchar(255) ,
    columnName varchar(255)  NOT NULL,
    sort_order integer  null,
    endDate  TIMESTAMP  NULL


        CONSTRAINT pk_SciShield_reference PRIMARY KEY (value)

);


