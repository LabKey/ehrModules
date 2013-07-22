ALTER TABLE ehr_lookups.cage_type ADD supportsTunnel bit;
GO
UPDATE ehr_lookups.cage_type SET supportsTunnel = 0;
UPDATE ehr_lookups.cage_type SET supportsTunnel = 1 WHERE cagetype LIKE 'Tunnel - %';
ALTER TABLE ehr_lookups.cage_type DROP COLUMN CageCapacity;

ALTER TABLE ehr_lookups.cage ADD hasTunnel bit;
