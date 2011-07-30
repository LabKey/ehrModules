SELECT
h.Id,
max(h.date) as date,
max(h.enddate) as enddate,
group_concat(DISTINCT h.room.area) as area,
group_concat(DISTINCT h.room) as room,
group_concat(DISTINCT h.cage) as cage,
group_concat(DISTINCT h.cond) as cond,
group_concat(DISTINCT h.remark) as remark,
group_concat(DISTINCT h.reason) as reason,
group_concat(DISTINCT h.performedby) as performedby,
group_concat(DISTINCT h.restraintType) as restraintType,
group_concat(DISTINCT h.cagesJoined) as cagesJoined
FROM Housing h
WHERE h.enddate is null and h.qcstate.publicdata = true
group by h.id