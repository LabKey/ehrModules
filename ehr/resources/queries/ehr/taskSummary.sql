SELECT
  t.formType,
  cast(t.created as date) as created,
  count(*) as total

FROM ehr.tasks t

GROUP BY t.formType, cast(t.created as date)