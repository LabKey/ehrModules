CREATE TABLE ehr_billing.chargeRateExemptions (

  rowId INT IDENTITY(1,1) NOT NULL,
  project int,
  chargeId int,
  unitcost double precision,
  startDate datetime,
  endDate datetime,
  remark nvarchar(4000),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created datetime,
  modifiedBy USERID,
  modified datetime,

  CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId)
);

CREATE TABLE ehr_billing.chargeUnits (

  chargetype nvarchar(100) NOT NULL,
  shownInBlood bit default 0,
  shownInLabwork bit default 0,
  shownInMedications bit default 0,
  shownInProcedures bit default 0,
  servicecenter nvarchar(100),

  active bit default 1,
  container entityid,
  createdBy int,
  created datetime,
  modifiedBy int,
  modified datetime,

  CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype)
);