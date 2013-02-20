SELECT
  p.parentid,
  group_concat(p.remark, chr(10)) as summary
FROM ehr.encounter_summaries p
GROUP BY p.parentid