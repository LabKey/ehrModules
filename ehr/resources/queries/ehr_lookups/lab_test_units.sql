SELECT
  DISTINCT units as units

FROM ehr_lookups.lab_tests
WHERE units IS NOT NULL and units != ''