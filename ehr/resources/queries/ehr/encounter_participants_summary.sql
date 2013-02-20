SELECT
  p2.parentid,
  GROUP_CONCAT(DISTINCT p2.userrole, '') as participants
FROM (
SELECT
  p.role || ': ' || p.username || chr(10) as userrole,
  p.parentid
FROM ehr.encounter_participants p
) p2

GROUP BY p2.parentid