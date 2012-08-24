CREATE TABLE ehr.chargedItems (
    rowid SERIAL NOT NULL,
    id varchar(100),
    date TIMESTAMP,
    debitedaccount varchar(100),
    creditedaccount varchar(100),
    category varchar(100),
    item varchar(500),
    quantity double precision,
    unitcost double precision,
    totalcost double precision,
    comment varchar(4000),
    flag integer,

    container ENTITYID NOT NULL,
    createdBy USERID,
    created TIMESTAMP,
    modifiedBy USERID,
    modified TIMESTAMP,

    CONSTRAINT PK_charged_items PRIMARY KEY (RowId)
);

ALTER TABLE ehr.snomed_tags ADD schemaName varchar(100);
ALTER TABLE ehr.snomed_tags ADD queryName varchar(100);
ALTER TABLE ehr.snomed_tags ADD qualifier varchar(200);
ALTER TABLE ehr.snomed_tags ADD sort integer;


CREATE TABLE ehr.accounts (
    account varchar(100),
    "grant" varchar(100),
    investigator integer,
    startdate TIMESTAMP,
    enddate TIMESTAMP,
    externalid varchar(200),
    comment varchar(4000),
    tier integer,

    createdBy USERID,
    created TIMESTAMP,
    modifiedBy USERID,
    modified TIMESTAMP,

    CONSTRAINT PK_accounts PRIMARY KEY (account)
);

CREATE TABLE ehr.investigators (
    RowId SERIAL NOT NULL,
    FirstName varchar(100),
    LastName varchar(100),
    Position varchar(100),
    Address varchar(500),
    City varchar(100),
    State varchar(100),
    Country varchar(100),
    ZIP integer,
    PhoneNumber varchar(100),
    InvestigatorType varchar(100),
    EmailAddress varchar(100),
    DateCreated TIMESTAMP,
    DateDisabled TIMESTAMP,
    Division varchar(100),

    --container entityid,
    createdby userid,
    created TIMESTAMP,
    modifiedby userid,
    modified TIMESTAMP,
    CONSTRAINT pk_investigators PRIMARY KEY (rowid)
);
