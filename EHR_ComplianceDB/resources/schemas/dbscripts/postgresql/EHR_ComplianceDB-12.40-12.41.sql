ALTER TABLE ehr_compliancedb.Employees add taskid entityid;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add taskid entityid;

ALTER TABLE ehr_compliancedb.Employees add objectid entityid;

ALTER TABLE ehr_complianEHR_ComplianceDB-12.42-12.43.sqledb.RequirementsPerCategory add objectid entityid;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add trackingflag nvarchar(50);