CREATE INDEX snomed_code_container ON ehr_lookups.snomed (code, container);
CREATE INDEX snomed_subset_codes_container_code ON ehr_lookups.snomed_subset_codes (container, code);
CREATE INDEX snomed_subset_codes_container_primarycategory ON ehr_lookups.snomed_subset_codes (container, primarycategory);
