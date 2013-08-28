SELECT
s.code,
s.meaning,
group_concat(ss.primaryCategory) as categories

FROM ehr_lookups.snomed s
LEFT JOIN ehr_lookups.snomed_subset_codes ss ON (s.code = ss.code)

GROUP BY s.code, s.meaning