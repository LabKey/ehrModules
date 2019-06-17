/*
 * Copyright (c) 2016-2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
--implemented based on SQLServer database engine tuning monitor
CREATE INDEX rooms_room_area ON ehr_lookups.rooms (room, area);