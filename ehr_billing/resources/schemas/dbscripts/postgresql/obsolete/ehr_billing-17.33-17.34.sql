/*
 * Copyright (c) 2018 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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