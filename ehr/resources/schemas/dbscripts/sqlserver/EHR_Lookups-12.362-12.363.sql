EXEC sp_rename 'ehr_lookups.procedure_default_treatments.concentration_units', 'conc_units', 'COLUMN';

EXEC sp_rename 'ehr_lookups.procedure_default_treatments.volume_units', 'vol_units', 'COLUMN';

UPDATE ehr_lookups.procedure_default_treatments set amount = dosage;
UPDATE ehr_lookups.procedure_default_treatments set dosage = null;

UPDATE ehr_lookups.procedure_default_treatments set amount_units = dosage_units;
UPDATE ehr_lookups.procedure_default_treatments set dosage_units = null;