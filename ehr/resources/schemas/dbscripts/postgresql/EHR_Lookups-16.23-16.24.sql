
DROP INDEX ehr_lookups.ehr_lookups_set_name_value;
CREATE UNIQUE INDEX ehr_lookups_set_name_value_container ON ehr_lookups.lookups (set_name, value, container);