/*
 * Copyright (c) 2019 LabKey Corporation
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
  rowId SERIAL NOT NULL,
  name varchar(100) NOT NULL,
  dateDisabled timestamp,

  container entityid NOT NULL,
  createdBy int,
  created timestamp,
  modifiedBy int,
  modified timestamp,

  CONSTRAINT PK_chargeableItemCategories PRIMARY KEY (rowId)
);

TRUNCATE ehr_billing.chargeableItems;
ALTER TABLE ehr_billing.chargeableItems DROP COLUMN category;
ALTER TABLE ehr_billing.chargeableItems ADD chargeCategoryId INT NOT NULL;
ALTER TABLE ehr_billing.chargeableItems ADD CONSTRAINT fk_chargeableItems FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowId);
CREATE INDEX IX_ehr_billing_chargebleItems ON ehr_billing.chargeableItems (chargeCategoryId);