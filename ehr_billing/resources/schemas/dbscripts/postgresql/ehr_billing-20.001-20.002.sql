-- Convert from a plain index to a unique constraint
SELECT core.fn_dropifexists ('aliases', 'ehr_billing', 'INDEX', 'EHR_BILLING_ALIASES_INDEX');

ALTER TABLE ehr_billing.aliases ADD CONSTRAINT UNIQUE_ALIAS UNIQUE (Container, alias);
