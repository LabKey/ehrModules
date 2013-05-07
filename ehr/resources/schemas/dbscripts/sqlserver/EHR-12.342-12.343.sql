CREATE INDEX animal_group_members_groupId_container ON ehr.animal_group_members (groupId, container);

--NOTE: this is different than the SQLServer version
CREATE INDEX project_investigatorid_project ON ehr.project (investigatorId ASC, project ASC) INCLUDE (name);