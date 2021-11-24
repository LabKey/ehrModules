ALTER TABLE ehr_lookups.cage DROP CONSTRAINT UQ_cage;
DROP INDEX cage_location ON ehr_lookups.cage;
alter table ehr_lookups.cage alter column location nvarchar(100);
CREATE INDEX cage_location ON ehr_lookups.cage (location ASC);
ALTER TABLE ehr_lookups.cage ADD CONSTRAINT UQ_cage UNIQUE (Container,Location);