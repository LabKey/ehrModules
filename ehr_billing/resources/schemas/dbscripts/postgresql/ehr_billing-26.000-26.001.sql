-- Dropping unique_invoice_num [invoiceNumber] because it overlaps with pk_ehr_billing_invoice_invnum [invoiceNumber]
ALTER TABLE ehr_billing.invoice DROP CONSTRAINT unique_invoice_num;
-- Dropping ix_ehr_billing_invoice_invoicenumber [invoiceNumber] because it overlaps with pk_ehr_billing_invoice_invnum [invoiceNumber]
DROP INDEX ehr_billing.ix_ehr_billing_invoice_invoicenumber;
-- Dropping uq_ehr_billing_invoice_invoicenumber [invoiceNumber] because it overlaps with pk_ehr_billing_invoice_invnum [invoiceNumber]
ALTER TABLE ehr_billing.invoice DROP CONSTRAINT uq_ehr_billing_invoice_invoicenumber;
