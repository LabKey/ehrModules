SELECT core.fn_dropifexists('*', 'ehr', 'SCHEMA', NULL);

CREATE SCHEMA ehr;

CREATE TABLE ehr.snomed_mapping
(
    RowId SERIAL NOT NULL,
    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    record character varying(32),
    snomed character varying(32),

    CONSTRAINT PK_snomed_mapping PRIMARY KEY (RowId)
);

CREATE TABLE ehr.requests
(
    RequestId SERIAL NOT NULL,
    Container ENTITYID NOT NULL,
    CreatedBy USERID NOT NULL,
    Created TIMESTAMP NOT NULL,
    ModifiedBy USERID NOT NULL,
    Modified TIMESTAMP NOT NULL,

    Description TEXT,

    CONSTRAINT PK_requests PRIMARY KEY (RequestId)
);