/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

DROP TABLE IF EXISTS ehr_lookups.treatment_frequency;
CREATE TABLE ehr_lookups.treatment_frequency (
RowId serial NOT NULL,
meaning varchar(100) DEFAULT NULL NOT NULL,
sort_order integer,

CONSTRAINT PK_treatment_frequency PRIMARY KEY (rowid)
)
WITH (OIDS=FALSE)

;

--note: it is important that the rowIDs are consistent for legacy purposes
INSERT INTO ehr_lookups.treatment_frequency
(rowid, meaning, sort_order)
VALUES
(1, 'Daily - AM', 1),
(11, 'Daily - Noon', 2),
(4, 'Daily - PM', 3),
(5, 'Daily - Night', 4),
(2, 'Daily - AM/PM', 5),
(6, 'Daily - AM/Night', 6),
(3, 'Daily - AM/PM/Night', 7),
(12, 'Daily - Any Time', 8),
(7, 'Weekly', 9),
(8, 'Monthly', 10),
(9, 'Alternating Days', 11)
;


delete from ehr_lookups.amount_units where unit = 'no units';
INSERT INTO ehr_lookups.amount_units VALUES ('no units');

delete from ehr_lookups.volume_units where unit = 'no units';
INSERT INTO ehr_lookups.volume_units VALUES ('no units');


delete from ehr_lookups.dental_teeth;
INSERT INTO ehr_lookups.dental_teeth VALUES ('M3', '1');
INSERT INTO ehr_lookups.dental_teeth VALUES ('M2', '2');
INSERT INTO ehr_lookups.dental_teeth VALUES ('M1', '3');
INSERT INTO ehr_lookups.dental_teeth VALUES ('PM3', '4');
INSERT INTO ehr_lookups.dental_teeth VALUES ('PM2', '5');
INSERT INTO ehr_lookups.dental_teeth VALUES ('PM1', '6');
INSERT INTO ehr_lookups.dental_teeth VALUES ('K9', '7');
INSERT INTO ehr_lookups.dental_teeth VALUES ('I2', '8');
INSERT INTO ehr_lookups.dental_teeth VALUES ('I1', '9');


DROP TABLE IF EXISTS ehr_lookups.microchip_comments;
CREATE TABLE ehr_lookups.microchip_comments (
comment varchar(100),

CONSTRAINT PK_microchip_comments PRIMARY KEY (comment)
)
WITH (OIDS=FALSE)

;

insert into  ehr_lookups.microchip_comments
(comment) VALUES
('ok'),
('placed today'),
('not present')
;


INSERT INTO ehr_lookups.blood_tube_volumes
(tube_types, volume) VALUES
('EDTA', 3)
;