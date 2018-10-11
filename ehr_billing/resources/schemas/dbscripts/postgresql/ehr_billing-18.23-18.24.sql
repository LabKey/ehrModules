CREATE TABLE ehr_billing.dataAccess (
  rowId serial NOT NULL,
  userid int,
  investigatorId int,
  project int,
  allData boolean,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_dataAccess PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_DATA_ACCESS_CONTAINER_INDEX ON ehr_billing.dataAccess (Container);