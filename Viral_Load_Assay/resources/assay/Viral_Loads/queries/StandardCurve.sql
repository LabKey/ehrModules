select
  d.subjectid,
  d.run,
  d.ct,
  d.inputCopies,
  CASE
    WHEN d.inputCopies > 0 THEN log10(d.inputCopies)
    ELSE null
  END as logInputCopies

FROM (
  SELECT
    d.subjectid,
    d.run,
    coalesce(d.cp, 0) as ct,
    case
      WHEN locate('_', d.subjectId) > 0 THEN cast(substring(d.subjectid, locate('_', d.subjectId) + 1, length(d.subjectid)) as float)
      else null
    END as inputCopies

  FROM Data d
  WHERE d.category = 'Standard'
) d

WHERE d.inputCopies > 0 and ct > 0