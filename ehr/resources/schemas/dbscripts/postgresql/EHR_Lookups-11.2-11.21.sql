/*
 * Copyright (c) 2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


alter table ehr_lookups.routes
  add column meaning varchar(200)
;


-- ----------------------------
-- Table structure for ehr_lookups.obs_remarks
-- ----------------------------
DROP TABLE IF EXISTS ehr_lookups.obs_remarks;
CREATE TABLE ehr_lookups.obs_remarks (
title varchar(100),
remark varchar(500),

CONSTRAINT PK_obs_remarks PRIMARY KEY (title)
)
WITH (OIDS=FALSE)

;

-- ----------------------------
-- Records of obs_remarks
-- ----------------------------
INSERT INTO ehr_lookups.obs_remarks (title, remark)
VALUES
('Euthanasia', 'Monkey was euthanized and submitted for pathological examination'),
('Found dead', 'Monkey was found dead and submitted for pathological examination'),
('Died during medical treatment', 'Monkey died during clinical procedure and was submitted for pathological examination'),
('Died during experimental procedure', 'Monkey died during experimental procedure and was submitted for pathological examination')
;

insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Animal Death', 'An email will be sent each time an animal is marked as dead')
;
