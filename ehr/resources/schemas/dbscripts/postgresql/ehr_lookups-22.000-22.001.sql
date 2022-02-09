ALTER TABLE ehr_lookups.cage ADD COLUMN Lsid LSIDtype;
ALTER TABLE ehr_lookups.areas ADD COLUMN Lsid LSIDtype;

CREATE TABLE ehr_lookups.floors (
    rowId SERIAL,
    floor varchar(100),
    building varchar(100),
    name varchar(100),
    description varchar(100),
    created timestamp,
    createdby integer,
    modified timestamp,
    modifiedby integer,
    container ENTITYID NOT NULL,
    Lsid LSIDtype,

    CONSTRAINT PK_Floors PRIMARY KEY (rowId),
    CONSTRAINT FK_Floors_Container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);
CREATE INDEX IX_Ehr_Lookups_Floors_Container ON ehr_lookups.floors (Container);