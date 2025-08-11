/**
  * This query is designed to find housing records that overlap.  In this query, the overlap to calculated based on both date and time
  * A record that ends at the same time that a second record begins is not considered an overlap.

  Modified by Kollil on 7/23/25 - Added Area field to the query and the rooms are filtered by area(s) selected, refer to tkt # 12894
  */
SELECT
    h.lsid,
    h.id,
    h.room.area as area, -- Added by Kollil
    h.room,
    h.cage,
    h.date,
    h.enddate,
    h.reason,
    h.remark,
    h.qcstate
FROM study.housing h
WHERE
    h.qcstate = 18

