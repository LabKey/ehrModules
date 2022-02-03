ALTER TABLE ehr_lookups.cage ADD Lsid LSIDtype;
ALTER TABLE ehr_lookups.areas ADD Lsid LSIDtype;

CREATE TABLE ehr_lookups.floors (
    rowId int identity(1,1),
    floor NVARCHAR(100),
    building NVARCHAR(100),
    name NVARCHAR(100),
    description NVARCHAR(100),
    created datetime,
    createdby integer,
    modified datetime,
    modifiedby integer,
    container ENTITYID NOT NULL,
    Lsid LSIDtype,

    CONSTRAINT PK_Floors PRIMARY KEY (rowId),
    CONSTRAINT FK_Floors_Container FOREIGN KEY (container) REFERENCES core.Containers (EntityId)
);
CREATE INDEX IX_Ehr_Lookups_Floors_Container ON ehr_lookups.floors (Container);