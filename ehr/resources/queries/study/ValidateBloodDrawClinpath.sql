/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */

select

b.lsid,
b.id,
b.date,
b.additionalservices,
b.tube_type,
b.tube_vol,
b.num_tubes,
b.quantity,
b.requestid,
b.taskid,
b.qcstate,
c.lsid as path_lsid,
c.date as path_date,
c.taskid as path_taskid,
c.requestid as path_requestid,
c.serviceRequested,

from study."Blood Draws" b
left join study."Clinpath Runs" c on (
  b.id = c.id
  and cast(b.date as date) = cast(c.date as date)
  and c.serviceRequested like 'CBC%'
  )

where b.requestid is not null and b.additionalservices like '%CBC%'

union all

select

b.lsid,
b.id,
b.date,
b.additionalservices,
b.tube_type,
b.tube_vol,
b.num_tubes,
b.quantity,
b.requestid,
b.taskid,
b.qcstate,
c.lsid as path_lsid,
c.date as path_date,
c.taskid as path_taskid,
c.requestid as path_requestid,
c.serviceRequested,

from study."Blood Draws" b
left join study."Clinpath Runs" c on (
  b.id = c.id
  and cast(b.date as date) = cast(c.date as date)
  and c.serviceRequested like 'Vet-19%'
  )

where b.requestid is not null and b.additionalservices like '%Vet-19%'