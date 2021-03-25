-- contents of ehr-20.001-20.002.sql
EXEC core.fn_dropifexists 'form_framework_types', 'ehr', 'column', 'url';
GO
ALTER TABLE ehr.form_framework_types add url varchar(255) DEFAULT NULL;

EXEC core.fn_dropifexists 'form_framework_types', 'ehr', 'CONSTRAINT', 'ehr_form_framework_types_unique';
GO
ALTER TABLE ehr.form_framework_types ADD CONSTRAINT ehr_form_framework_types_unique UNIQUE (RowId);