DROP INDEX ehr_lookups.rooms_sort_order_room;

CREATE INDEX ehr_lookups_set_name_value ON ehr_lookups.lookups (set_name, value);