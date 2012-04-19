/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

delete from ehr.notificationtypes where notificationtype in (
'Clinpath Abnormal Results',
'Clinpath Results',
'Clinpath Admin Alerts',
'Incomplete Treatments',
'Weight Drops',
'Admin Alerts',
'Blood Admin Alerts',
'Blood Alerts',
'Colony Alerts',
'Colony Alerts Lite',
'Colony Management Alerts',
'Overdue Weight Alerts',
'Site Error Alerts'

);

delete from ehr.notificationtypes where notificationtype = 'Colony Validation - General';

insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Clinpath Abnormal Results', 'An email will be sent periodically to summarize abnormal clinpath results'),
('Clinpath Results', 'A daily email will be sent to summarize finalized clinpath results'),
('Clinpath Admin Alerts', 'A daily email will be sent to summarize clinpath requests'),
('Incomplete Treatments', 'An email will be sent 3-4X per day to summarize incomplete treatments'),
('Weight Drops', 'An email will be sent daily to summarize weight drops in the last 3 days'),
('Admin Alerts', 'An email will be sent daily to summarize site usage, client errors, etc.'),
('Blood Admin Alerts', 'An email will be sent daily to summarize the blood schedule and problems with it.'),
('Blood Alerts', 'An email will be sent 3X daily to summarize completed and scheduled blood draws.'),
('Colony Alerts', 'An email will be sent daily to summarize many aspects of the colony, focused on data validation.'),
('Colony Alerts Lite', 'An hourly email will be mailed if any data problems are identified, such as double housing.'),
('Colony Management Alerts', 'An email will be sent daily to summarize information related to colony management and housing.'),
('Overdue Weight Alerts', 'An email will be sent daily to summarize animals overdue for weights.'),
('Site Error Alerts', 'An hourly email will be sent if a new site error is reported.')
;