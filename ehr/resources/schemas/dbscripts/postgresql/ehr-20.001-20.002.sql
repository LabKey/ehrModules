-- contents of ehr-18.32-18.33.sql & ehr-18.33-18.34.sql from wnprc18.3 svn
ALTER TABLE ehr.form_framework_types add column url varchar(255) DEFAULT NULL;
ALTER TABLE ehr.form_framework_types ADD CONSTRAINT ehr_form_framework_types_unique UNIQUE (RowId);