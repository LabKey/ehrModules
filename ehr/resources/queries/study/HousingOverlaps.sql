PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP, Area CHAR DEFAULT NULL, Room CHAR DEFAULT NULL, Cage CHAR DEFAULT NULL)

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
    (h.room.area = Area OR Area IS NULL OR Area = '') AND -- Added by Kollil
    (h.room = ROOM OR ROOM IS NULL or ROOM = '') AND
    (h.cage = CAGE OR CAGE IS NULL OR CAGE = '') AND

/* entered startdate must be <= entered enddate */
    coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(ENDDATE, now())
  and

/* entered startdate must be less than record's enddate */
    coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) < coalesce(h.enddate, now())
  and

/* entered enddate must be greater than record's startdate */
    coalesce(ENDDATE, now()) >= coalesce(h.date, now())