ALTER TABLE ehr.formtemplates DROP CONSTRAINT UNIQUE_formTemplates;

ALTER TABLE ehr.formtemplates ADD CONSTRAINT UNIQUE_formTemplates UNIQUE (container, formtype, title);
