ALTER TABLE ehr_lookups.drug_defaults ADD category varchar(100);
ALTER TABLE ehr_lookups.drug_defaults ADD volume_rounding double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD amount_rounding double precision;
ALTER TABLE ehr_lookups.drug_defaults ADD amount_max double precision;