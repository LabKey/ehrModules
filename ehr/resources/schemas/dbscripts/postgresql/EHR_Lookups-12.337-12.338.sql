--implemented based on SQLServer database engine tuning monitor
CREATE INDEX cage_cagetype_room_cage ON ehr_lookups.cage (cage_type, room, cage);
CREATE INDEX cage_cagetype_room_cage_divider_type ON ehr_lookups.cage (room, cage, divider, cage_type);