CREATE INDEX IDX_requests_requestid_container ON ehr.requests (requestid, container);
CREATE INDEX IDX_container_project_objectid_name ON ehr.project (container, project, objectid, name);

--stats, sql server only
CREATE STATISTICS STATS_project_objectid_container_project ON ehr.project (objectid, container, project);
CREATE STATISTICS STATS_project_project_objectid ON ehr.project (project, objectid);
