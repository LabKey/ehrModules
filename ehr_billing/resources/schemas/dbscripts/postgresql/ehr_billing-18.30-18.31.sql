CREATE TABLE ehr_billing.fiscalAuthorities (
  rowid serial,
  faid varchar(100),
  firstName varchar(100),
  lastName varchar(100),
  position varchar(100),
  address varchar(500),
  city varchar(100),
  state varchar(100),
  country varchar(100),
  zip varchar(100),
  phoneNumber varchar(100),
  active boolean default true,
  objectid ENTITYID,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT pk_fiscalAuthorities PRIMARY KEY (rowid),
  CONSTRAINT FK_EHR_BILLING_FISCAL_AUTHORITIES_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_FISCAL_AUTHORITIES_CONTAINER_INDEX ON ehr_billing.fiscalAuthorities (container);

ALTER TABLE ehr_billing.aliases DROP COLUMN aliasEnabled;
ALTER TABLE ehr_billing.aliases ADD isAcceptingCharges boolean DEFAULT true;
