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

ALTER TABLE ehr_billing.chargeableItems DROP COLUMN category;
ALTER TABLE ehr_billing.chargeableItems ADD chargeCategoryId INT NOT NULL;
ALTER TABLE ehr_billing.chargeableItems ADD CONSTRAINT fk_chargeableItems FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowId);
CREATE INDEX IX_ehr_billing_chargebleItems ON ehr_billing.chargeableItems (chargeCategoryId);