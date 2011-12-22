/*
 * Copyright (c) 2011 LabKey Corporation
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

INSERT INTO ehr_lookups.treatment_frequency
(rowid, meaning, sort_order)
VALUES
(1, 'Daily - AM', 1),
(4, 'Daily - PM', 2),
(5, 'Daily - Night', 3),
(2, 'Daily - AM/PM', 4),
(6, 'Daily - AM/Night', 5),
(3, 'Daily - AM/PM/Night', 6),
(7, 'Weekly', 7),
(8, 'Monthly', 8),
(9, 'Alternating Days', 9)
;