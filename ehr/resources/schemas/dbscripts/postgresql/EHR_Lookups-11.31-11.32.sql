/*
 * Copyright (c) 2012 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

ALTER table ehr_lookups.blood_draw_services
   add column automaticrequestfromblooddraw boolean not null default true;

update ehr_lookups.blood_draw_services
   set automaticrequestfromblooddraw = false where service = 'Viral Load';