-- Handle upgrade for ONPRC which had a 17.20-17.21 script to do this change

IF NOT EXISTS(select * from sys.all_columns c inner join sys.objects o on (o.object_id = c.object_id) inner join sys.schemas s on (s.schema_id = o.schema_id) where c.name='datedisabled' and o.name='flag_categories' and s.name='ehr_lookups')
BEGIN
EXEC ('ALTER TABLE ehr_lookups.flag_categories ADD datedisabled DATETIME');
END
GO