-- Convert from a plain index to a unique constraint
EXEC core.fn_dropifexists 'aliases', 'ehr_billing', 'INDEX', 'EHR_BILLING_ALIASES_INDEX';
GO

ALTER TABLE ehr_billing.aliases ADD CONSTRAINT UNIQUE_ALIAS UNIQUE (alias, Container);
