/*
 * Copyright (c) 2011-2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */


insert into ehr.notificationtypes
(notificationtype,description) VALUES
('Blood Draw Request Completed', 'An email will be sent each time a blood draw request is completed'),
('Blood Draw Request Denied', 'An email will be sent each time a blood draw request is denied'),
('Clinpath Request Completed', 'An email will be sent each time a clinpath request is completed'),
('Clinpath Request Denied', 'An email will be sent each time a clinpath request is denied')
;



alter TABLE ehr.notificationRecipients
  add column Recipient2 integer
;

update ehr.notificationRecipients set recipient2 = cast(recipient as integer);

alter TABLE ehr.notificationRecipients
  drop column Recipient
;

alter TABLE ehr.notificationRecipients
  rename column Recipient2 to Recipient
;


