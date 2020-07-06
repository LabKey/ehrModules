DROP TABLE IF EXISTS ehr.form_framework_types;
CREATE TABLE ehr.form_framework_types (
  RowId SERIAL NOT NULL,

  schemaname varchar(255) DEFAULT NULL,
  queryname varchar(255) DEFAULT NULL,
  framework varchar(255) DEFAULT NULL,

  Container ENTITYID NOT NULL,
  CreatedBy USERID,
  Created TIMESTAMP,
  ModifiedBy USERID,
  Modified TIMESTAMP,

  CONSTRAINT PK_form_framework_types PRIMARY KEY (schemaname, queryname)
);