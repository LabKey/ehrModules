/*
*
*
*
*/
SELECT 
code.meaning || ' (' || code.code || ')' as distributionVal
FROM snomed_subset_codes s
WHERE s.primaryCategory = 'Distribution'
;
