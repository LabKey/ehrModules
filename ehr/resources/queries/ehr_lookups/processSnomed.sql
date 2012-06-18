/*
*       
*/
SELECT
code.meaning || ' (' || code.code || ')' as processVal

FROM snomed_subset_codes s
WHERE s.primaryCategory = 'Process/Disorder'
;
