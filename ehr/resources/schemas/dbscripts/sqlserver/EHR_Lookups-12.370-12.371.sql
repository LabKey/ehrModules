EXEC core.fn_dropifexists 'snomed', 'ehr_lookups', 'CONSTRAINT', 'PK_snomed';
ALTER TABLE ehr_lookups.snomed ADD rowid int identity(1,1);

GO
ALTER TABLE ehr_lookups.snomed ADD CONSTRAINT pk_snomed PRIMARY KEY (rowid);
