/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


alter table ehr.protocols rename to protocol;

DROP TABLE IF EXISTS ehr.project;
CREATE TABLE ehr.project
(
    project integer not null,
    protocol varchar(200),
    account varchar(200),
    inves varchar(4000),
    avail varchar(100),
    title varchar(4000),
    research boolean,
    reqname varchar(4000),
    requestId varchar(100),
    QCState integer,

    --Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_project PRIMARY KEY (project)
);

DROP TABLE IF EXISTS ehr.protocolProcedures;
CREATE TABLE ehr.protocolProcedures
(
    rowid serial not null,
    protocol varchar(200) not null,
    procedureName varchar(200),
    code varchar(100),
    allowed double precision,
    frequency varchar(2000),

    --Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_protocolProcedures PRIMARY KEY (rowid)
);