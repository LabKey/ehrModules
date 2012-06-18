/*
*
*
*
*/
SELECT 
code.meaning || ' (' || code.code || ')' as severityVal
FROM snomed_subset_codes s
WHERE s.primaryCategory = 'Severity Codes'
;
