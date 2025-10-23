
CREATE TABLE ehr_lookups.editable_lookups
(
    rowId SERIAL NOT NULL,
    sch varchar(255),
    query varchar(255),
    category varchar(255),
    title varchar(255),
    description varchar(255),

    CONSTRAINT PK_editable_lookups PRIMARY KEY (rowId)
);