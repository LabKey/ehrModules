/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


DROP TABLE IF EXISTS ehr.formTypes;
CREATE TABLE ehr.formTypes
(
    rowid serial not null,
    formtype varchar(200) NOT NULL,
    category varchar (100),
    description text,
    configJson varchar(4000),

    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    CONSTRAINT PK_formTypes PRIMARY KEY (rowid),
    CONSTRAINT UNIQUE_formTypes UNIQUE (container, formtype)
);

alter table ehr.protocols
  drop column container;

alter table ehr.project
  drop column container;

DROP TABLE IF EXISTS ehr.animal_groups;
CREATE TABLE ehr.animal_groups (
    rowid serial not null,
    name varchar(255) NOT NULL,

    Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_animal_groups PRIMARY KEY (rowid)
);


DROP TABLE IF EXISTS ehr.supplemental_pedigree;
CREATE TABLE ehr.supplemental_pedigree (
    rowid serial not null,
    Id varchar(50) NOT NULL,
    gender varchar(50),
    dam varchar(50),
    sire varchar(50),

    --Container ENTITYID NOT NULL,
    CreatedBy USERID,
    Created TIMESTAMP,
    ModifiedBy USERID,
    Modified TIMESTAMP,

    CONSTRAINT PK_supplemental_pedigree PRIMARY KEY (rowid)
);
