SELECT core.fn_dropifexists('snomed', 'ehr_lookups', 'CONSTRAINT', 'PK_snomed');
ALTER TABLE ehr_lookups.snomed ADD rowid SERIAL;

ALTER TABLE ehr_lookups.snomed ADD CONSTRAINT pk_snomed PRIMARY KEY (rowid);
