CREATE INDEX project_name_project ON ehr.project (name, project);

CREATE INDEX snomed_tags_code_container ON ehr.snomed_tags (code, container);
