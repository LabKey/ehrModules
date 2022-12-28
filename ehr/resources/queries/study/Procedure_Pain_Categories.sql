--Get the pain categories from the lookup sets
--B, C, D
Select rowId, value from ehr_lookups.lookups where set_name like 'Procedure_Pain_Categories'