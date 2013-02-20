SELECT
  p2.parentid,
  GROUP_CONCAT(DISTINCT p2.flag, chr(10)) as flags
FROM (
SELECT
  p.flag || ': ' || p.value as flag,
  p.parentid
FROM ehr.encounter_flags p
) p2

GROUP BY p2.parentid