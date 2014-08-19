DROP INDEX rooms_sort_order_room ON ehr_lookups.rooms;

CREATE INDEX ehr_lookups_set_name_value ON ehr_lookups.lookups (set_name, value);