CREATE TABLE ehr.form_framework_types (
  RowId INT IDENTITY(1,1) NOT NULL,

  schemaname varchar(255) DEFAULT NULL,
  queryname varchar(255) DEFAULT NULL,
  framework varchar(255) DEFAULT NULL,

  Container ENTITYID NOT NULL,
  CreatedBy USERID,
  Created datetime,
  ModifiedBy USERID,
  Modified datetime,

  CONSTRAINT PK_form_framework_types PRIMARY KEY (schemaname, queryname)
);