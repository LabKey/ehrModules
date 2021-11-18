DROP INDEX cage_location ON ehr_lookups.cage (location);
alter table ehr_lookups.cage alter column location nvarchar(100);
CREATE INDEX cage_location ON ehr_lookups.cage (location ASC);