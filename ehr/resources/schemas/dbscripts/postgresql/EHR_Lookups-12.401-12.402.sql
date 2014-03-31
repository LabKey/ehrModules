CREATE TABLE ehr_lookups.flag_values (
    rowid serial,
    category varchar(100),
    flag_value varchar(1000),
    int_value integer,

    container entityid,
    created timestamp,
    createdby int,
    modified timestamp,
    modifiedby int
);

ALTER TABLE ehr_lookups.procedures DROP COLUMN timeofmeds;