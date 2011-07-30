
select
-- c.room.area as area,
c.room

from study.ActiveHousing c

left join study.obs o ON (o.Id.curLocation.room = c.room and cast(o.date as date) = cast(now() as date))
left join ehr.cage_observations co ON (co.room = c.room and cast(co.date as date) = cast(now() as date))
where

(o.id is null and co.room is null)

group by c.room