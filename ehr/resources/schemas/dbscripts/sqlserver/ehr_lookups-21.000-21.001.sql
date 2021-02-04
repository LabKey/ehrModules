-- Conditionally add column to match with onprc19.1Prod changes
IF NOT EXISTS(select * from sys.all_columns c inner join sys.objects o on (o.object_id = c.object_id) inner join sys.schemas s on (s.schema_id = o.schema_id) where c.name='remark' and o.name='drug_defaults' and s.name='ehr_lookups')
BEGIN
EXEC ('ALTER TABLE ehr_lookups.drug_defaults ADD remark varchar(1000)');
END
GO

ALTER TABLE ehr_lookups.drug_defaults ALTER COLUMN remark nvarchar(1000);
