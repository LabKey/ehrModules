CREATE TABLE ehr_billing.dataAccess (
  rowId int identity(1,1) NOT NULL,
  userid int,
  investigatorId int,
  project int,
  allData bit,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created DATETIME,
  modifiedBy USERID,
  modified DATETIME,

  CONSTRAINT PK_dataAccess PRIMARY KEY (rowId),
  CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_CONTAINER FOREIGN KEY (Container) REFERENCES core.Containers (EntityId)
);

CREATE INDEX EHR_BILLING_DATA_ACCESS_CONTAINER_INDEX ON ehr_billing.dataAccess (Container);
GO