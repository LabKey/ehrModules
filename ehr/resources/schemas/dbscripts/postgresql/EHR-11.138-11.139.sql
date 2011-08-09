/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr.kinship;
CREATE TABLE ehr.kinship (
    RowId SERIAL NOT NULL,

    Id varchar(100) NOT NULL,
    Id2 varchar(100) NOT NULL,
    coefficient double precision DEFAULT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_kinship PRIMARY KEY (RowId)
);

update ehr.qcStateMetadata set qcstatelabel = 'Completed' WHERE qcstatelabel = 'Approved';
