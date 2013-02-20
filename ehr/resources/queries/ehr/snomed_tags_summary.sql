SELECT
  p2.recordid,
  GROUP_CONCAT(DISTINCT p2.code, '') as codes
FROM (
SELECT
  p.code.meaning || ' (' || p.code || ')' || chr(10) as code,
  p.recordid
FROM ehr.snomed_tags p
) p2

GROUP BY p2.recordid