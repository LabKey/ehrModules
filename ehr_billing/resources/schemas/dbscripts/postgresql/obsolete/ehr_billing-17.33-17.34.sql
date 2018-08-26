CREATE TABLE ehr_billing.chargeRateExemptions (

  rowId SERIAL NOT NULL,
  project int,
  chargeId int,
  unitcost double precision,
  startDate timestamp,
  endDate timestamp,
  remark varchar(4000),

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeRateExemptions PRIMARY KEY (rowId)
);

CREATE TABLE ehr_billing.chargeUnits (

  chargetype varchar(100) NOT NULL,
  shownInBlood boolean default false,
  shownInLabwork boolean default false,
  shownInMedications boolean default false,
  shownInProcedures boolean default false,
  servicecenter varchar(100),

  active boolean default true,
  container entityid,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_chargeUnits PRIMARY KEY (chargetype)
);