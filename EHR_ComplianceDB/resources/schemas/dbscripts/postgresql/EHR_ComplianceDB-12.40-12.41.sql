ALTER TABLE ehr_compliancedb.Employees add taskid entityid;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add taskid entityid;

ALTER TABLE ehr_compliancedb.Employees add objectid entityid;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add objectid entityid;

ALTER TABLE ehr_compliancedb.RequirementsPerCategory add trackingflag nvarchar(50);