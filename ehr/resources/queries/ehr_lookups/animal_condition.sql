SELECT
  v.code,
  v.value as meaning,
  v.datedisabled
FROM ehr_lookups.flag_values v
WHERE v.category = 'Condition'