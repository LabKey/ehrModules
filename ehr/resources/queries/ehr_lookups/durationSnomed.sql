/*
*
*
*
*/
SELECT 
code.meaning || ' (' || code.code || ')' as durationVal
FROM snomed_subset_codes s
WHERE s.primaryCategory = 'Duration'
;
