DROP TABLE ehr_lookups.flag_values;

CREATE TABLE ehr_lookups.flag_values (
    rowid serial not null,
    category varchar(100),
    value varchar(1000),
    code integer,
    description varchar(2000),

    datedisabled timestamp,

    container entityid NOT NULL,
    createdby int NOT NULL,
    created timestamp NOT NULL,
    modifiedby int NOT NULL,
    modified timestamp NOT NULL,

    CONSTRAINT PK_flag_values PRIMARY KEY (rowid)
);