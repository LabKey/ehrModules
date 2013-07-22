ALTER TABLE ehr_lookups.cage_type ADD supportsTunnel bool;
UPDATE ehr_lookups.cage_type SET supportsTunnel = false;
UPDATE ehr_lookups.cage_type SET supportsTunnel = true WHERE cagetype LIKE 'Tunnel - %';
ALTER TABLE ehr_lookups.cage_type DROP COLUMN CageCapacity;

ALTER TABLE ehr_lookups.cage ADD hasTunnel bool;