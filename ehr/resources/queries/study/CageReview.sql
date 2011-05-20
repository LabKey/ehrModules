/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

a.id,

a.location as location,
a.id.cageclass.MostRecentWeight as MostRecentWeight,

a.location.length as length,
a.location.width as width,
-- a.id.location.location.length as length,
-- a.id.location.location.width as width,

round((a.location.length * a.location.width)/144, 1) as CageSqft,
a.id.cageclass.ReqSqft,
a.id.cageclass.ReqSqft / (a.id.numRoommates.NumRoommates+1) as ReqSqFt2,

a.location.height as CageHeight,
a.id.cageclass.ReqHeight,

a.id.numRoommates.NumRoommates

FROM study.demographicsCurLocation a

WHERE

-- NOTE: dimension is in inches
--((a.location.length * a.location.width)/144) < ( a.id.cageclass.ReqSqft / (a.id.numRoommates.NumRoommates+1))

-- OR

a.location.height < a.id.cageclass.ReqHeight


