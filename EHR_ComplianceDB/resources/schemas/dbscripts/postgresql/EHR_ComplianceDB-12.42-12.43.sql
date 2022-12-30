CREATE TABLE ehr_compliancedb.Compliance_Reference_Data (
        rowId int identity(1,1),
        label varchar(250) DEFAULT NULL,
        value varchar(255) ,
        columnName varchar(255)  NOT NULL,
        sort_order integer  null,
        endDate  TIMESTAMP  DEFAULT NULL,
        objectid entityid

            CONSTRAINT pk_compliance_reference PRIMARY KEY (value)
);
