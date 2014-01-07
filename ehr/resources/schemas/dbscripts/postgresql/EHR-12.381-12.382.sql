ALTER TABLE ehr.formtemplates drop column template;
ALTER TABLE ehr.formtemplaterecords ADD targettemplate varchar(100);