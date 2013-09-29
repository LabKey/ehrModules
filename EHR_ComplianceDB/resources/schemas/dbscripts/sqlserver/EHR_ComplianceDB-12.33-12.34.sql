ALTER TABLE ehr_compliancedb.requirements ADD container entityid;
GO
--upgrade of sorts.  both wnprc/onprc should have a single container, so set container based on employees
UPDATE ehr_compliancedb.requirements SET container = (SELECT max(cast(c.container as varchar(38))) as container from ehr_compliancedb.employees c);
