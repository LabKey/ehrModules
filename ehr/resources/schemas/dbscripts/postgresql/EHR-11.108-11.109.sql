/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */



INSERT INTO ehr.qcStateMetadata
(QCStateLabel,draftData,isDeleted,isRequest)
VALUES
('Completed', FALSE, FALSE, FALSE),
('Scheduled', TRUE, FALSE, FALSE)
;