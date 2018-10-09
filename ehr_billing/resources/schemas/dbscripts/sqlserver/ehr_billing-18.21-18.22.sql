
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

ALTER TABLE ehr_billing.chargeableItems DROP COLUMN category;
GO
ALTER TABLE ehr_billing.chargeableItems ADD chargeCategoryId INT NOT NULL;
GO
ALTER TABLE ehr_billing.chargeableItems ADD CONSTRAINT fk_chargeableItems FOREIGN KEY (chargeCategoryId) REFERENCES ehr_billing.chargeableItemCategories (rowId);
GO
CREATE INDEX IX_ehr_billing_chargebleItems ON ehr_billing.chargeableItems (chargeCategoryId);
GO