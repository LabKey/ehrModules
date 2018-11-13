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

CREATE TABLE ehr_billing.chargeableItemCategories (
  rowId int identity(1,1) NOT NULL,
  name varchar(100) NOT NULL,
  dateDisabled datetime,

  container entityid NOT NULL,
  createdBy int,
  created datetime,
  modifiedBy int,
  modified datetime,

  CONSTRAINT PK_chargeableItemCategories PRIMARY KEY (rowId)
);
GO

TRUNCATE TABLE ehr_billing.chargeableItems;
GO
ALTER TABLE ehr_billing.chargeableItems DROP COLUMN category;
GO
ALTER TABLE ehr_billing.chargeableItems ADD chargeCategoryId INT NOT NULL;
GO
ALTER TABLE ehr_billing.chargeableItems ADD CONSTRAINT fk_chargeableItems FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowId);
GO
CREATE INDEX IX_ehr_billing_chargebleItems ON ehr_billing.chargeableItems (chargeCategoryId);
GO