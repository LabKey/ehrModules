CREATE INDEX rooms_sort_order_room ON ehr_lookups.rooms (sort_order, room);

--NOTE: this is different than the SQLServer version
CREATE INDEX cage_location ON ehr_lookups.cage (location ASC);
CREATE INDEX rooms_room_sort_order ON ehr_lookups.rooms (room) INCLUDE (sort_order);