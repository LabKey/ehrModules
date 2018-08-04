/*
 * Copyright (c) 2017 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

CREATE TABLE ehr_billing.chargeableItems (

  rowId INT IDENTITY(1,1) NOT NULL,
  name  nvarchar(200),
  shortName  nvarchar(100),
  category  nvarchar(200),
  comment  nvarchar(4000),
  active  bit default 1,
  startDate  datetime,
  endDate  datetime,
  itemCode nvarchar(100),
  departmentCode  nvarchar(100),
  allowsCustomUnitCost bit DEFAULT 0,
  canRaiseFA bit DEFAULT 0,
  allowBlankId bit DEFAULT 0,

  container ENTITYID NOT NULL,
  createdBy USERID,
  created  datetime,
  modifiedBy USERID,
  modified  datetime,

  CONSTRAINT PK_chargeableItems PRIMARY KEY (rowId)
);