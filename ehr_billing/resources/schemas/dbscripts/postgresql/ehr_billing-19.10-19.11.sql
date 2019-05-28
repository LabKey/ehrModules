-- dropping to avoid duplicate index, EHR_BILLING_ALIASES_INDEX includes index to container
SELECT core.fn_dropifexists ('aliases', 'ehr_billing', 'INDEX', 'ehr_billing_aliases_container_index');

-- constraint and index in chargeRates table
SELECT core.fn_dropifexists ('chargeRates', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_CHARGE_RATES_CHARGEID');
ALTER TABLE ehr_billing.chargeRates ADD CONSTRAINT FK_EHR_BILLING_CHARGE_RATES_CHARGEID FOREIGN KEY (chargeId) REFERENCES ehr_billing.chargeableItems (rowid);

SELECT core.fn_dropifexists ('chargeRates', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATES_CHARGEID');
CREATE INDEX IX_EHR_BILLING_CHARGE_RATES_CHARGEID ON ehr_billing.chargeRates (chargeId);

-- constraint and index in dataaccess table
SELECT core.fn_dropifexists ('dataaccess', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_DATA_ACCESS_PROJECT');
CREATE INDEX IX_EHR_BILLING_DATA_ACCESS_PROJECT ON ehr_billing.dataaccess (project);

SELECT core.fn_dropifexists ('dataaccess', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_DATA_ACCESS_USERID');
ALTER TABLE ehr_billing.dataaccess ADD CONSTRAINT FK_EHR_BILLING_DATA_ACCESS_USERID FOREIGN KEY (userid) REFERENCES core.Usersdata (UserId);

SELECT core.fn_dropifexists ('dataaccess', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_DATA_ACCESS_USERID');
CREATE INDEX IX_EHR_BILLING_DATA_ACCESS_USERID ON ehr_billing.dataaccess (userid);

-- constraint and index in invoice table
SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICE_INVOICERUNID');
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT FK_EHR_BILLING_INVOICE_INVOICERUNID FOREIGN KEY (invoicerunid) REFERENCES ehr_billing.invoiceRuns (objectid);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICERUNID');
CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICERUNID ON ehr_billing.invoice (invoicerunid);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER');
CREATE INDEX IX_EHR_BILLING_INVOICE_ACCOUNTNUMBER ON ehr_billing.invoice (accountnumber);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'CONSTRAINT', 'UQ_EHR_BILLING_INVOICE_INVOICENUMBER');
ALTER TABLE ehr_billing.invoice ADD CONSTRAINT UQ_EHR_BILLING_INVOICE_INVOICENUMBER UNIQUE (invoicenumber);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_INVOICENUMBER');
CREATE INDEX IX_EHR_BILLING_INVOICE_INVOICENUMBER ON ehr_billing.invoice (invoicenumber);

-- constraint and index in invoicedItems
SELECT core.fn_dropifexists ('invoiceditems', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_INVOICED_ITEMS_CHARGEID');
ALTER TABLE ehr_billing.invoiceditems ADD CONSTRAINT FK_EHR_BILLING_INVOICED_ITEMS_CHARGEID FOREIGN KEY (chargeid) REFERENCES ehr_billing.chargeableItems (rowid);

SELECT core.fn_dropifexists ('invoiceditems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICED_ITEMS_CHARGEID');
CREATE INDEX IX_EHR_BILLING_INVOICED_ITEMS_CHARGEID ON ehr_billing.invoiceditems (chargeid);

-- constraint and index in miscCharges
SELECT core.fn_dropifexists ('misccharges', 'ehr_billing', 'CONSTRAINT', 'FK_EHR_BILLING_MISC_CHARGES_CHARGEID');
ALTER TABLE ehr_billing.misccharges ADD CONSTRAINT FK_EHR_BILLING_MISC_CHARGES_CHARGEID FOREIGN KEY (chargeid) REFERENCES ehr_billing.chargeableItems (rowid);

SELECT core.fn_dropifexists ('misccharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_CHARGEID');
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_CHARGEID ON ehr_billing.misccharges (chargeid);

SELECT core.fn_dropifexists ('misccharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_PROJECT');
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_PROJECT ON ehr_billing.misccharges (project);

-- index on lsid col in extensible tables
SELECT core.fn_dropifexists ('aliases', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_ALIASES_LSID');
CREATE INDEX IX_EHR_BILLING_ALIASES_LSID ON ehr_billing.aliases (lsid);

SELECT core.fn_dropifexists ('chargeRates', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATES_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGE_RATES_LSID ON ehr_billing.chargeRates (lsid);

SELECT core.fn_dropifexists ('chargeableItems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGEABLE_ITEMS_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGEABLE_ITEMS_LSID ON ehr_billing.chargeableItems (lsid);

SELECT core.fn_dropifexists ('invoiceRuns', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_RUNS_LSID');
CREATE INDEX IX_EHR_BILLING_INVOICE_RUNS_LSID ON ehr_billing.invoiceRuns (lsid);

SELECT core.fn_dropifexists ('invoicedItems', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICED_ITEMS_LSID');
CREATE INDEX IX_EHR_BILLING_INVOICED_ITEMS_LSID ON ehr_billing.invoicedItems (lsid);

SELECT core.fn_dropifexists ('miscCharges', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_MISC_CHARGES_LSID');
CREATE INDEX IX_EHR_BILLING_MISC_CHARGES_LSID ON ehr_billing.miscCharges (lsid);

SELECT core.fn_dropifexists ('chargeUnits', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_UNITS_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGE_UNITS_LSID ON ehr_billing.chargeUnits (lsid);

SELECT core.fn_dropifexists ('chargeRateExemptions', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_LSID');
CREATE INDEX IX_EHR_BILLING_CHARGE_RATE_EXEMPTIONS_LSID ON ehr_billing.chargeRateExemptions (lsid);

SELECT core.fn_dropifexists ('invoice', 'ehr_billing', 'INDEX', 'IX_EHR_BILLING_INVOICE_LSID');
CREATE INDEX IX_EHR_BILLING_INVOICE_LSID ON ehr_billing.invoice (lsid);