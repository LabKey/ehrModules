-- same contents as ehr-20.001-20.002.sql.
-- Rationale: When ehr-20.001-20.002.sql was created, the module version was bumped from 21.001 to 21.002
-- rendering ehr-20.001-20.002.sql useless if the ehr module v. was already at 21.00x in the db.
-- The script should have been numbered ehr-21.001-21.002.sql instead of ehr-20.001-20.002.sql.
-- This script is an correction attempt to get in sync with the ehr module v. 21.00x so that this script runs
-- and below col and constraint gets added as intended.

EXEC core.fn_dropifexists 'form_framework_types', 'ehr', 'column', 'url';
GO
ALTER TABLE ehr.form_framework_types add url varchar(255) DEFAULT NULL;

EXEC core.fn_dropifexists 'form_framework_types', 'ehr', 'CONSTRAINT', 'ehr_form_framework_types_unique';
GO
ALTER TABLE ehr.form_framework_types ADD CONSTRAINT ehr_form_framework_types_unique UNIQUE (RowId);