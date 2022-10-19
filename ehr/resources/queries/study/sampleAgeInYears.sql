
PARAMETERS(sampleDate TIMESTAMP)

SELECT
    d.id,
    ROUND(CONVERT(age_in_months(d.birth, COALESCE(d.lastDayAtCenter, now())), DOUBLE) / 12, 1) AS atSample
FROM study.Demographics d