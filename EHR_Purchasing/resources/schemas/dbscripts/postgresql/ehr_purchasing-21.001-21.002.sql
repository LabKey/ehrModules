DROP INDEX ehr_purchasing.IDX_EHR_PURCHASING_LINE_ITEMS_REQUEST_ID;
ALTER TABLE ehr_purchasing.lineItems DROP CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_REQUEST_ID;
ALTER TABLE ehr_purchasing.lineItems DROP COLUMN requestId;

ALTER TABLE ehr_purchasing.lineItems ADD requestRowId int;
ALTER TABLE ehr_purchasing.lineItems ADD CONSTRAINT FK_EHR_PURCHASING_LINE_ITEMS_REQUEST_ROW_ID FOREIGN KEY (requestRowId) REFERENCES ehr_purchasing.purchasingRequests (rowId);
CREATE INDEX IDX_EHR_PURCHASING_LINE_ITEMS_REQUEST_ROW_ID ON ehr_purchasing.lineItems (requestRowId);

ALTER TABLE ehr_purchasing.purchasingRequests DROP CONSTRAINT UQ_EHR_PURCHASING_REQUESTS_REQUEST_ID;
ALTER TABLE ehr_purchasing.purchasingRequests DROP COLUMN requestId;

ALTER TABLE ehr_purchasing.userAccountAssociations ADD COLUMN accessToAllAccounts boolean default false;
ALTER TABLE ehr_purchasing.userAccountAssociations DROP CONSTRAINT UQ_EHR_PURCHASING_USER_ACCT_ASSOCIATIONS;
ALTER TABLE ehr_purchasing.userAccountAssociations DROP COLUMN account;
ALTER TABLE ehr_purchasing.userAccountAssociations ADD COLUMN account varchar(200);