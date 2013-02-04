select

a.id.curLocation.room,
group_concat(distinct a.project.name, ', ') as projects,
group_concat(distinct a.project.investigatorId.lastname, ', ') as investigators,
count(distinct a.id) as totalAnimals

from study.assignment a

where a.enddateCoalesced >= curdate() and a.id.curLocation.room IS NOT NULL

group by a.id.curLocation.room