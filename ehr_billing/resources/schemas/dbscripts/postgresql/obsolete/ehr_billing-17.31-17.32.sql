/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

CREATE TABLE ehr_billing.chargeableItems (

  rowId SERIAL NOT NULL,
  name varchar(200),
  shortName varchar(100),
  category varchar(200),
  comment varchar(4000),
  active boolean default true,
  startDate timestamp,
  endDate timestamp,
  itemCode varchar(100),
  departmentCode varchar(100),
  allowsCustomUnitCost boolean DEFAULT false,
  canRaiseFA boolean DEFAULT false,
  allowBlankId boolean DEFAULT false,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created timestamp,
  modifiedBy USERID,
  modified timestamp,

  CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId)
);