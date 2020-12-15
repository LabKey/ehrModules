ALTER TABLE ehr_purchasing.lineItems ADD quantity double precision NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN requestId SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN item SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN itemUnitId SET NOT NULL;
ALTER TABLE ehr_purchasing.lineItems ALTER COLUMN unitCost SET NOT NULL;

ALTER TABLE ehr_purchasing.purchasingRequests ADD assignedTo USERID NOT NULL;
ALTER TABLE ehr_purchasing.purchasingRequests ADD confirmation varchar;
ALTER TABLE ehr_purchasing.purchasingRequests ADD shippingAttentionTo varchar;  --this is different per request

ALTER TABLE ehr_purchasing.shippingInfo DROP attentionTo; --this changes per request, so dropping from shippingInfo table and is now added to purchasingRequest table above
ALTER TABLE ehr_purchasing.shippingInfo ADD shippingAlias varchar;
ALTER TABLE ehr_purchasing.shippingInfo ADD streetAddress varchar NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ADD notes varchar;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN city SET NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN state SET NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN country SET NOT NULL;
ALTER TABLE ehr_purchasing.shippingInfo ALTER COLUMN zip SET NOT NULL;

ALTER TABLE ehr_purchasing.vendor ADD faxNumber varchar(50);
ALTER TABLE ehr_purchasing.vendor ADD url varchar;
ALTER TABLE ehr_purchasing.vendor ADD notes varchar;
ALTER TABLE ehr_purchasing.vendor ADD isValidVendor boolean default true;
ALTER TABLE ehr_purchasing.vendor ADD streetAddress varchar NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN vendorName SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN city SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN state SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN country SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ALTER COLUMN zip SET NOT NULL;
ALTER TABLE ehr_purchasing.vendor ADD CONSTRAINT UQ_EHR_PURCHASING_VENDOR_NAME UNIQUE (vendorName);

-- add index on lsid cols
CREATE INDEX IX_EHR_PURCHASING_VENDOR_LSID ON ehr_purchasing.vendor (LSID);
CREATE INDEX IX_EHR_PURCHASING_SHIPPING_INFO_LSID ON ehr_purchasing.shippingInfo (LSID);
CREATE INDEX IX_EHR_PURCHASING_ITEM_UNITS_LSID ON ehr_purchasing.itemUnits (LSID);
CREATE INDEX IX_EHR_PURCHASING_USER_ACCT_ASSOC_LSID ON ehr_purchasing.userAccountAssociations (LSID);
CREATE INDEX IX_EHR_PURCHASING_LINE_ITEM_STATUS_LSID ON ehr_purchasing.lineItemStatus (LSID);
CREATE INDEX IX_EHR_PURCHASING_PURCHASING_REQUESTS_LSID ON ehr_purchasing.purchasingRequests (LSID);
CREATE INDEX IX_EHR_PURCHASING_LINE_ITEMS_LSID ON ehr_purchasing.lineItems (LSID);




