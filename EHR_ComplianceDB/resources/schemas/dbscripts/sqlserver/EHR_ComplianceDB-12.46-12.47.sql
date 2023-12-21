CREATE TABLE ehr_compliancedb.Employee_Assigned_Location
(
        rowId int identity(1,1),
        location varchar(500) NULL,
        employeeid varchar(255),
        status varchar(255) ,
        endDate  datetime  NULL,
        comments   varchar(500) NULL,
        Container ENTITYID NOT NULL,
        CreatedBy USERID,
        Created datetime,
        ModifiedBy USERID,
        Modified datetime,
        taskid entityid,
        sort_order integer  null,
        objectid entityid

            CONSTRAINT pk_employee_location

                PRIMARY KEY (objectid)

);
