/*
 * Copyright (c) 2010 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT

a.id,

a.id.curLocation.location as location,

a.id.curLocation.location.length as length,
a.id.curLocation.location.width as width,
a.id.curLocation.location.height as CageHeight,

round((a.id.curLocation.location.length * a.id.curLocation.location.width)/144, 1) as CageSqft,

a.id.cageclass.ReqSqft,



a.id.cageclass.ReqHeight

FROM study.demographics a

WHERE

--dimensions in inches
round((a.id.curLocation.location.length * a.id.curLocation.location.width)/144, 1) < a.id.cageclass.ReqSqFt

OR

a.id.curLocation.location.height < a.id.cageclass.ReqHeight


