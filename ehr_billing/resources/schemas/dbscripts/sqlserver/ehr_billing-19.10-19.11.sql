-- dropping to avoid duplicate index, EHR_BILLING_ALIASES_INDEX includes index to container
EXEC core.fn_dropifexists 'aliases', 'ehr_billing', 'INDEX', 'ehr_billing_aliases_container_index';
GO

-- constraint and index in chargeRates table
EXEC core.fn_dropifexists 'chargeRates', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_CHARGE_RATES_CHARGEID';
GO
ALTER TABLE ehr_billing.chargeRates ADD CONSTRAINT FK_EHR_BILLING_CHARGE_RATES_CHARGEID FOREIGN KEY (chargeId) REFERENCES ehr_billing.chargeableItems (rowid);
GO

EXEC core.fn_dropifexists 'chargeRates', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATES_CHARGEID';
GO
CREATE INDEX IX_EHR_BILLING_CHARGE_RATES_CHARGEID ON ehr_billing.chargeRates (chargeId);
GO

-- constraint and index in dataaccess table
EXEC core.fn_dropifexists 'dataaccess', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_DATA_ACCESS_PROJECT';
GO
CREATE INDEX IX_EHR_BILLING_DATA_ACCESS_PROJECT ON ehr_billing.dataaccess (project);
GO

EXEC core.fn_dropifexists 'dataaccess', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_DATA_ACCESS_USERID';
GO
ALTER TABLE ehr_billing.dataaccess ADD CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_USERID FOREIGN KEY (userid) REFERENCES core.Usersdata (UserId);
GO

EXEC core.fn_dropifexists 'dataaccess', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_DATA_ACCESS_USERID';
GO
CREATE INDEX IX_EHR_BILLING_DATA_ACCESS_USERID ON ehr_billing.dataaccess (userid);
GO

-- constraint and index in invoice table
EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICE_INVOICERUNID';
GO
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT FK_EHR_BILLING_INVOICE_INVOICERUNID FOREIGN KEY (invoicerunid) REFERENCES ehr_billing.invoiceRuns (objectid);
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICERUNID';
GO
CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICERUNID ON ehr_billing.invoice (invoicerunid);
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER';
GO
CREATE INDEX IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER ON ehr_billing.invoice (accountnumber);
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'CONSTRAINT', 'UQ_EHR_BILLING_INVOICE_INVOICENUMBER';
GO
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UQ_EHR_BILLING_INVOICE_INVOICENUMBER UNIQUE (invoicenumber);
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICENUMBER';
GO
CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICENUMBER ON ehr_billing.invoice (invoicenumber);
GO

-- constraint and index in invoicedItems table
EXEC core.fn_dropifexists 'invoiceditems', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICED_ITEMS_CHARGEID';
GO
ALTER TABLE ehr_billing.invoiceditems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CHARGEID FOREIGN KEY (chargeid) REFERENCES ehr_billing.chargeableItems (rowid);
GO

EXEC core.fn_dropifexists 'invoiceditems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICED_ITEMS_CHARGEID';
GO
CREATE INDEX IX_EHR_BILLING_INVOICED_ITEMS_CHARGEID ON ehr_billing.invoiceditems (chargeid);
GO

-- constraint and index in misccharges table
EXEC core.fn_dropifexists 'misccharges', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_MISC_CHARGES_CHARGEID';
GO
ALTER TABLE ehr_billing.misccharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CHARGEID FOREIGN KEY (chargeid) REFERENCES ehr_billing.chargeableItems (rowid);
GO

EXEC core.fn_dropifexists 'misccharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_CHARGEID';
GO
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_CHARGEID ON ehr_billing.misccharges (chargeid);
GO

EXEC core.fn_dropifexists 'misccharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_PROJECT';
GO
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_PROJECT ON ehr_billing.misccharges (project);
GO

-- index on lsid col in extensible tables
EXEC core.fn_dropifexists 'aliases', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_ALIASES_LSID';
GO
CREATE INDEX IX_EHR_BILLING_ALIASES_LSID ON ehr_billing.aliases (lsid);
GO

EXEC core.fn_dropifexists 'chargeRates', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATES_LSID';
GO
CREATE INDEX IX_EHR_BILLING_CHARGE_RATES_LSID ON ehr_billing.chargeRates (lsid);
GO

EXEC core.fn_dropifexists 'chargeableItems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGEABLE_ITEMS_LSID';
GO
CREATE INDEX IX_EHR_BILLING_CHARGEABLE_ITEMS_LSID ON ehr_billing.chargeableItems (lsid);
GO

EXEC core.fn_dropifexists 'invoiceRuns', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_RUNS_LSID';
GO
CREATE INDEX IX_EHR_BILLING_INVOICE_RUNS_LSID ON ehr_billing.invoiceRuns (lsid);
GO

EXEC core.fn_dropifexists 'invoicedItems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICED_ITEMS_LSID';
GO
CREATE INDEX IX_EHR_BILLING_INVOICED_ITEMS_LSID ON ehr_billing.invoicedItems (lsid);
GO

EXEC core.fn_dropifexists 'miscCharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_LSID';
GO
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_LSID ON ehr_billing.miscCharges (lsid);
GO

EXEC core.fn_dropifexists 'chargeUnits', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_UNITS_LSID';
GO
CREATE INDEX IX_EHR_BILLING_CHARGE_UNITS_LSID ON ehr_billing.chargeUnits (lsid);
GO

EXEC core.fn_dropifexists 'chargeRateExemptions', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_LSID';
GO
CREATE INDEX IX_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_LSID ON ehr_billing.chargeRateExemptions (lsid);
GO

EXEC core.fn_dropifexists 'invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_LSID';
GO
CREATE INDEX IX_EHR_BILLING_INVOICE_LSID ON ehr_billing.invoice (lsid);
GO