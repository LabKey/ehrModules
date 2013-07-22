ALTER TABLE ehr_lookups.cage_type ADD verticalSlots integer;
UPDATE ehr_lookups.cage_type SET verticalSlots = 1;
UPDATE ehr_lookups.cage_type SET verticalSlots = 2 WHERE cagetype LIKE 'Tunnel - %';