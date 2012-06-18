/*
*
*
*/
SELECT
code.meaning || ' (' || code.code || ')' as inflammationVal
FROM snomed_subset_codes s
WHERE s.primaryCategory = 'Inflammation'
;
