/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

h.Id,

h.StartDate,
h.DaysCoHoused

FROM study.housingRoommates h

WHERE h.condition = 'p' AND h.DaysCoHoused < 31