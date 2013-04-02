SELECT
  c.cage
FROM ehr_lookups.cage c
LEFT JOIN ehr_lookups.cage_positions cp ON (c.cage = cp.cage)
WHERE cp.cage IS NULL;