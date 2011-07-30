/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Incompleted Treatments', 'An email will be sent each day at 8:30, 15:30 and 20:30 notifying of any incompleted treatments')
;

DROP TABLE IF EXISTS ehr.automatic_alerts;
CREATE TABLE ehr.automatic_alerts (
rowid serial not null,
title varchar(200) DEFAULT NULL,

ContainerPath varchar(255) DEFAULT NULL,
SchemaName varchar(255) DEFAULT NULL,
QueryName varchar(255) DEFAULT NULL,
ViewName varchar(255) DEFAULT NULL,
notificationtype varchar(100) default null,
email_html text DEFAULT NULL,

Container ENTITYID NOT NULL,
CreatedBy USERID NOT NULL,
Created TIMESTAMP NOT NULL,
ModifiedBy USERID NOT NULL,
Modified TIMESTAMP NOT NULL,

CONSTRAINT PK_automatic_alerts PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;
