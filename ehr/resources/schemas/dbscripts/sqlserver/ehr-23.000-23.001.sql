ALTER TABLE ehr.animal_groups ALTER COLUMN name NVARCHAR(255) NOT NULL;
ALTER TABLE ehr.animal_groups ALTER COLUMN category NVARCHAR(100);
ALTER TABLE ehr.animal_groups ALTER COLUMN purpose NVARCHAR(MAX);
GO

ALTER TABLE ehr.cage_observations ALTER COLUMN room NVARCHAR(100);
ALTER TABLE ehr.cage_observations ALTER COLUMN cage NVARCHAR(100);
ALTER TABLE ehr.cage_observations ALTER COLUMN userid NVARCHAR(100);
ALTER TABLE ehr.cage_observations ALTER COLUMN feces NVARCHAR(100);
GO

EXEC core.fn_dropifexists 'encounter_flags', 'ehr', 'index', 'encounter_flags_id';
ALTER TABLE ehr.encounter_flags ALTER COLUMN id NVARCHAR(100);
GO
CREATE INDEX encounter_flags_id ON ehr.encounter_flags(id);
ALTER TABLE ehr.encounter_flags ALTER COLUMN schemaName NVARCHAR(100);
ALTER TABLE ehr.encounter_flags ALTER COLUMN queryName NVARCHAR(100);
ALTER TABLE ehr.encounter_flags ALTER COLUMN flag NVARCHAR(200);
ALTER TABLE ehr.encounter_flags ALTER COLUMN value NVARCHAR(100);
ALTER TABLE ehr.encounter_flags ALTER COLUMN remark NVARCHAR(MAX);
ALTER TABLE ehr.encounter_flags ALTER COLUMN objectid NVARCHAR(60);
GO

EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'index', 'encounter_participants_id';
ALTER TABLE ehr.encounter_participants ALTER COLUMN id NVARCHAR(100);
GO
CREATE INDEX encounter_participants_id ON ehr.encounter_participants(id);
ALTER TABLE ehr.encounter_participants ALTER COLUMN username NVARCHAR(500);
ALTER TABLE ehr.encounter_participants ALTER COLUMN comment NVARCHAR(MAX);
ALTER TABLE ehr.encounter_participants ALTER COLUMN role NVARCHAR(200);
EXEC core.fn_dropifexists 'encounter_participants', 'ehr', 'constraint', 'pk_encounter_participants';
ALTER TABLE ehr.encounter_participants ALTER COLUMN objectid NVARCHAR(60) NOT NULL;
GO
ALTER TABLE ehr.encounter_participants ADD CONSTRAINT pk_encounter_participants PRIMARY KEY (objectid);
GO

EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_id';
ALTER TABLE ehr.encounter_summaries ALTER COLUMN id NVARCHAR(100);
GO
CREATE INDEX encounter_summaries_id ON ehr.encounter_summaries(id);
ALTER TABLE ehr.encounter_summaries ALTER COLUMN schemaName NVARCHAR(100);
ALTER TABLE ehr.encounter_summaries ALTER COLUMN queryName NVARCHAR(100);
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'index', 'encounter_summaries_container_objectid';
EXEC core.fn_dropifexists 'encounter_summaries', 'ehr', 'constraint', 'PK_encounter_summaries';
ALTER TABLE ehr.encounter_summaries ALTER COLUMN objectid NVARCHAR(60) NOT NULL;
GO
ALTER TABLE ehr.encounter_summaries ADD CONSTRAINT PK_encounter_summaries PRIMARY KEY (objectid);
CREATE INDEX encounter_summaries_container_objectid ON ehr.encounter_summaries(container, objectid);
ALTER TABLE ehr.encounter_summaries ALTER COLUMN category NVARCHAR(100);
GO

ALTER TABLE ehr.extracts ALTER COLUMN queryname NVARCHAR(100);
ALTER TABLE ehr.extracts ALTER COLUMN schemaname NVARCHAR(100);
ALTER TABLE ehr.extracts ALTER COLUMN containerpath NVARCHAR(100);
ALTER TABLE ehr.extracts ALTER COLUMN viewname NVARCHAR(100);
ALTER TABLE ehr.extracts ALTER COLUMN filename NVARCHAR(100);
ALTER TABLE ehr.extracts ALTER COLUMN columns NVARCHAR(500);
ALTER TABLE ehr.extracts ALTER COLUMN fieldstohash NVARCHAR(500);
GO

DECLARE @ConstraintName nvarchar(200)
SELECT @ConstraintName = Name FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('ehr.form_framework_types') AND
    parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.form_framework_types') AND name = 'schemaname');
    IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE ehr.form_framework_types DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('ehr.form_framework_types') AND
    parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.form_framework_types') AND name = 'queryname');
IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE ehr.form_framework_types DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('ehr.form_framework_types') AND
    parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.form_framework_types') AND name = 'framework');
IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE ehr.form_framework_types DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name FROM sys.default_constraints
    WHERE parent_object_id = OBJECT_ID('ehr.form_framework_types') AND
    parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.form_framework_types') AND name = 'url');
IF @ConstraintName IS NOT NULL
BEGIN
    EXEC('ALTER TABLE ehr.form_framework_types DROP CONSTRAINT ' + @ConstraintName)
END

EXEC core.fn_dropifexists 'form_framework_types', 'ehr', 'constraint', 'PK_form_framework_types';
ALTER TABLE ehr.form_framework_types ALTER COLUMN schemaname NVARCHAR(255) NOT NULL;
ALTER TABLE ehr.form_framework_types ALTER COLUMN queryname NVARCHAR(255) NOT NULL;
GO
ALTER TABLE ehr.form_framework_types ADD CONSTRAINT PK_form_framework_types PRIMARY KEY (schemaname, queryname);
ALTER TABLE ehr.form_framework_types ALTER COLUMN framework NVARCHAR(255);
ALTER TABLE ehr.form_framework_types ALTER COLUMN url NVARCHAR(255);
GO

ALTER TABLE ehr.formpanelsections ALTER COLUMN formtype NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.formpanelsections ALTER COLUMN destination NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.formpanelsections ALTER COLUMN xtype NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.formpanelsections ALTER COLUMN schemaname NVARCHAR(200);
ALTER TABLE ehr.formpanelsections ALTER COLUMN queryname NVARCHAR(200);
ALTER TABLE ehr.formpanelsections ALTER COLUMN title NVARCHAR(200);
ALTER TABLE ehr.formpanelsections ALTER COLUMN metadatasources NVARCHAR(MAX);
ALTER TABLE ehr.formpanelsections ALTER COLUMN buttons NVARCHAR(MAX);
ALTER TABLE ehr.formpanelsections ALTER COLUMN initialtemplates NVARCHAR(MAX);
GO

ALTER TABLE ehr.formtemplaterecords ALTER COLUMN storeid NVARCHAR(1000) NOT NULL;
ALTER TABLE ehr.formtemplaterecords ALTER COLUMN targettemplate NVARCHAR(100);
GO

EXEC core.fn_dropifexists 'formtemplates', 'ehr', 'constraint', 'UNIQUE_formTemplates';
ALTER TABLE ehr.formtemplates ALTER COLUMN title NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.formtemplates ALTER COLUMN formtype NVARCHAR(200) NOT NULL;
GO
ALTER TABLE ehr.formtemplates ADD CONSTRAINT UNIQUE_formTemplates UNIQUE (container, formtype, title);
ALTER TABLE ehr.formtemplates ALTER COLUMN category NVARCHAR(100);
GO

EXEC core.fn_dropifexists 'formtypes', 'ehr', 'constraint', 'unique_formtypes';
ALTER TABLE ehr.formtypes ALTER COLUMN formtype NVARCHAR(200) NOT NULL;
GO
ALTER TABLE ehr.formtypes ADD CONSTRAINT unique_formtypes UNIQUE (container , formtype);
ALTER TABLE ehr.formtypes ALTER COLUMN category NVARCHAR(100);
ALTER TABLE ehr.formtypes ALTER COLUMN configjson NVARCHAR(MAX);
GO

ALTER TABLE ehr.institutions ALTER COLUMN affiliate NVARCHAR(50);
ALTER TABLE ehr.institutions ALTER COLUMN web_site NVARCHAR(200);
GO

ALTER TABLE ehr.investigators ALTER COLUMN firstName NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN lastName NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN position NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN address NVARCHAR(500);
ALTER TABLE ehr.investigators ALTER COLUMN city NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN state NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN country NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN zip NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN phoneNumber NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN investigatorType NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN emailAddress NVARCHAR(100);
ALTER TABLE ehr.investigators ALTER COLUMN division NVARCHAR(100);
GO

ALTER TABLE ehr.kinship ALTER COLUMN id NVARCHAR(100) NOT NULL;
ALTER TABLE ehr.kinship ALTER COLUMN id2 NVARCHAR(100) NOT NULL;
GO

DECLARE @ConstraintName nvarchar(200)
SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.module_properties') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.module_properties') AND name = 'prop_name');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.module_properties DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.module_properties') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.module_properties') AND name = 'stringvalue');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.module_properties DROP CONSTRAINT ' + @ConstraintName)
END

EXEC core.fn_dropifexists 'module_properties', 'ehr', 'constraint', 'unique_module_properties';
ALTER TABLE ehr.module_properties ALTER COLUMN prop_name NVARCHAR(255);
GO
ALTER TABLE ehr.module_properties ADD CONSTRAINT unique_module_properties UNIQUE (prop_name , container);
ALTER TABLE ehr.module_properties ALTER COLUMN stringvalue NVARCHAR(255);
GO

ALTER TABLE ehr.notificationrecipients ALTER COLUMN notificationtype NVARCHAR(200);
GO

EXEC core.fn_dropifexists 'notificationtypes', 'ehr', 'constraint', 'pk_notificationtypes';
ALTER TABLE ehr.notificationtypes ALTER COLUMN notificationtype NVARCHAR(200) NOT NULL;
GO
ALTER TABLE ehr.notificationtypes ADD CONSTRAINT pk_notificationtypes PRIMARY KEY (notificationtype )

ALTER TABLE ehr.observation_types ALTER COLUMN value NVARCHAR(200);
ALTER TABLE ehr.observation_types ALTER COLUMN category NVARCHAR(200);
ALTER TABLE ehr.observation_types ALTER COLUMN editorconfig NVARCHAR(MAX);
ALTER TABLE ehr.observation_types ALTER COLUMN schemaname NVARCHAR(200);
ALTER TABLE ehr.observation_types ALTER COLUMN queryname NVARCHAR(200);
ALTER TABLE ehr.observation_types ALTER COLUMN valuecolumn NVARCHAR(200);
GO

EXEC core.fn_dropifexists 'project', 'ehr', 'index', 'IDX_project_container_project_protocol';
ALTER TABLE ehr.project ALTER COLUMN protocol NVARCHAR(200);
GO
CREATE INDEX IDX_project_container_project_protocol ON ehr.project (container, project, protocol);
ALTER TABLE ehr.project ALTER COLUMN account NVARCHAR(200);
ALTER TABLE ehr.project ALTER COLUMN inves NVARCHAR(200);
ALTER TABLE ehr.project ALTER COLUMN avail NVARCHAR(100);
ALTER TABLE ehr.project ALTER COLUMN title NVARCHAR(400);
ALTER TABLE ehr.project ALTER COLUMN reqname NVARCHAR(200);
ALTER TABLE ehr.project ALTER COLUMN contact_emails NVARCHAR(MAX);
ALTER TABLE ehr.project ALTER COLUMN inves2 NVARCHAR(200);
EXEC core.fn_dropifexists 'project', 'ehr', 'index', 'project_name_project';
EXEC core.fn_dropifexists 'project', 'ehr', 'index', 'project_investigatorid_project';
EXEC core.fn_dropifexists 'project', 'ehr', 'index', 'IDX_container_project_objectid_name';
ALTER TABLE ehr.project ALTER COLUMN name NVARCHAR(100);
GO
CREATE INDEX project_investigatorid_project ON ehr.project (investigatorId ASC, project ASC) INCLUDE (name);
CREATE INDEX project_name_project ON ehr.project (name, project);
CREATE INDEX IDX_container_project_objectid_name ON ehr.project (container, project, objectid, name);
ALTER TABLE ehr.project ALTER COLUMN use_category NVARCHAR(100);
ALTER TABLE ehr.project ALTER COLUMN shortname NVARCHAR(200);
ALTER TABLE ehr.project ALTER COLUMN projecttype NVARCHAR(100);
GO

EXEC core.fn_dropifexists 'protocol', 'ehr', 'index', 'IDX_protocol_container_protocol';
ALTER TABLE ehr.protocol ALTER COLUMN protocol NVARCHAR(200) NOT NULL;
GO
CREATE INDEX IDX_protocol_container_protocol ON ehr.protocol (container, protocol);
ALTER TABLE ehr.protocol ALTER COLUMN inves NVARCHAR(200);
ALTER TABLE ehr.protocol ALTER COLUMN title NVARCHAR(1000);
ALTER TABLE ehr.protocol ALTER COLUMN usda_level NVARCHAR(100);
ALTER TABLE ehr.protocol ALTER COLUMN external_id NVARCHAR(200);
ALTER TABLE ehr.protocol ALTER COLUMN project_type NVARCHAR(200);
ALTER TABLE ehr.protocol ALTER COLUMN ibc_approval_num NVARCHAR(200);
ALTER TABLE ehr.protocol ALTER COLUMN contacts NVARCHAR(200);
GO

ALTER TABLE ehr.protocol_amendments ALTER COLUMN protocol NVARCHAR(200);
ALTER TABLE ehr.protocol_amendments ALTER COLUMN Comment NVARCHAR(MAX);
GO

ALTER TABLE ehr.protocol_counts ALTER COLUMN protocol NVARCHAR(200);
ALTER TABLE ehr.protocol_counts ALTER COLUMN species NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.protocol_counts ALTER COLUMN gender NVARCHAR(100);
ALTER TABLE ehr.protocol_counts ALTER COLUMN description NVARCHAR(MAX);
GO

ALTER TABLE ehr.protocolexemptions ALTER COLUMN protocol NVARCHAR(100);
ALTER TABLE ehr.protocolexemptions ALTER COLUMN exemption NVARCHAR(200);
ALTER TABLE ehr.protocolexemptions ALTER COLUMN remark NVARCHAR(MAX);
GO

ALTER TABLE ehr.protocolprocedures ALTER COLUMN protocol NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.protocolprocedures ALTER COLUMN procedurename NVARCHAR(200);
ALTER TABLE ehr.protocolprocedures ALTER COLUMN code NVARCHAR(100);
ALTER TABLE ehr.protocolprocedures ALTER COLUMN frequency NVARCHAR(200);
ALTER TABLE ehr.protocolprocedures ALTER COLUMN remark NVARCHAR(MAX);
GO

EXEC core.fn_dropifexists 'qcstatemetadata', 'ehr', 'constraint', 'pk_qcstatemetadata';
ALTER TABLE ehr.qcstatemetadata ALTER COLUMN qcstatelabel NVARCHAR(200) NOT NULL;
GO
ALTER TABLE ehr.qcstatemetadata ADD CONSTRAINT pk_qcstatemetadata PRIMARY KEY (qcstatelabel)
GO

DECLARE @ConstraintName nvarchar(200)
SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'reportname');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'datefieldname');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'qcstatepublicdatafieldname');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'report');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'reporttype');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'reporttitle');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'schemaname');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'viewname');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'category');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'containerpath');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

SELECT @ConstraintName = Name
FROM sys.default_constraints
WHERE parent_object_id = OBJECT_ID('ehr.reports') AND
        parent_column_id = (SELECT column_id FROM sys.columns WHERE object_id = OBJECT_ID('ehr.reports') AND name = 'queryname');
IF @ConstraintName IS NOT NULL
BEGIN
EXEC('ALTER TABLE ehr.reports DROP CONSTRAINT ' + @ConstraintName)
END

ALTER TABLE ehr.reports ALTER COLUMN reportname NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN category NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN reporttype NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN reporttitle NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN containerpath NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN schemaname NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN queryname NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN viewname NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN report NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN datefieldname NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN qcstatepublicdatafieldname NVARCHAR(255);
ALTER TABLE ehr.reports ALTER COLUMN jsonconfig NVARCHAR(MAX);
ALTER TABLE ehr.reports ALTER COLUMN description NVARCHAR(MAX);
ALTER TABLE ehr.reports ALTER COLUMN subjectIdFieldName NVARCHAR(200);
GO

ALTER TABLE ehr.requests ALTER COLUMN title NVARCHAR(200);
ALTER TABLE ehr.requests ALTER COLUMN formtype NVARCHAR(200);
ALTER TABLE ehr.requests ALTER COLUMN priority NVARCHAR(200);
ALTER TABLE ehr.requests ALTER COLUMN pi NVARCHAR(200);
ALTER TABLE ehr.requests ALTER COLUMN remark NVARCHAR(MAX);
GO

EXEC core.fn_dropifexists 'scheduled_task_types', 'ehr', 'constraint', 'pk_scheduled_task_types';
ALTER TABLE ehr.scheduled_task_types ALTER COLUMN tasktype NVARCHAR(200) NOT NULL;
GO
ALTER TABLE ehr.scheduled_task_types ADD CONSTRAINT pk_scheduled_task_types PRIMARY KEY (tasktype)

ALTER TABLE ehr.scheduled_tasks ALTER COLUMN tasktype NVARCHAR(200);
ALTER TABLE ehr.scheduled_tasks ALTER COLUMN id NVARCHAR(100);
ALTER TABLE ehr.scheduled_tasks ALTER COLUMN location NVARCHAR(100);
ALTER TABLE ehr.scheduled_tasks ALTER COLUMN description NVARCHAR(MAX);
GO

EXEC core.fn_dropifexists 'snomed_tags', 'ehr', 'index', 'snomed_tags_recordid';
EXEC core.fn_dropifexists 'snomed_tags', 'ehr', 'index', 'CIDX_snomed_tags';
ALTER TABLE ehr.snomed_tags ALTER COLUMN recordid NVARCHAR(200);
GO
CREATE INDEX snomed_tags_recordid ON ehr.snomed_tags (recordid);
CREATE CLUSTERED INDEX CIDX_snomed_tags ON ehr.snomed_tags (container, recordid, set_number, sort)
EXEC core.fn_dropifexists 'snomed_tags', 'ehr', 'index', 'snomed_tags_code_container';
ALTER TABLE ehr.snomed_tags ALTER COLUMN code NVARCHAR(32);
GO
CREATE INDEX snomed_tags_code_container ON ehr.snomed_tags (code, container);
ALTER TABLE ehr.snomed_tags ALTER COLUMN qualifier NVARCHAR(200);
EXEC core.fn_dropifexists 'snomed_tags', 'ehr', 'constraint', 'PK_snomed_tags';
ALTER TABLE ehr.snomed_tags ALTER COLUMN objectid NVARCHAR(60) NOT NULL;
GO
ALTER TABLE ehr.snomed_tags ADD CONSTRAINT PK_snomed_tags PRIMARY KEY NONCLUSTERED (objectid);
ALTER TABLE ehr.snomed_tags ALTER COLUMN id NVARCHAR(100);
GO

ALTER TABLE ehr.status ALTER COLUMN label NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.status ALTER COLUMN description NVARCHAR(MAX);
GO

ALTER TABLE ehr.supplemental_pedigree ALTER COLUMN id NVARCHAR(50) NOT NULL;
ALTER TABLE ehr.supplemental_pedigree ALTER COLUMN gender NVARCHAR(50);
ALTER TABLE ehr.supplemental_pedigree ALTER COLUMN dam NVARCHAR(50);
ALTER TABLE ehr.supplemental_pedigree ALTER COLUMN sire NVARCHAR(50);
ALTER TABLE ehr.supplemental_pedigree ALTER COLUMN species NVARCHAR(MAX);
GO

ALTER TABLE ehr.tasks ALTER COLUMN category NVARCHAR(200) NOT NULL;
ALTER TABLE ehr.tasks ALTER COLUMN title NVARCHAR(200);

EXEC core.fn_dropifexists 'tasks', 'ehr', 'index', 'IDX_container_taskid_formtype';
ALTER TABLE ehr.tasks ALTER COLUMN formtype NVARCHAR(200);
GO
CREATE INDEX IDX_container_taskid_formtype ON ehr.tasks (container, taskid, formtype);