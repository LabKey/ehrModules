CREATE TABLE ehr_compliancedb.Compliance_Reference_Data
(
        rowId SERIAL,
        label varchar(250) NULL,
        value varchar(255),
        columnName varchar(255) NOT NULL,
        sort_order integer NULL,
        endDate TIMESTAMP NULL,
        objectid entityid

        CONSTRAINT pk_compliance_reference PRIMARY KEY (value)
);
