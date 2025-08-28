PARAMETERS(StartDate TIMESTAMP, EndDate TIMESTAMP)

SELECT
    h.lsid,
    h.id,
    h.room,
    h.cage,
    h.date,
    h.enddate,
    h.reason,
    h.remark,
    h.qcstate

FROM study.housing h

WHERE

/* entered startdate must be <= entered enddate */
    coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) <= coalesce(ENDDATE, now())
  and

/* entered startdate must be less than record's enddate */
    coalesce( STARTDATE , cast('1900-01-01 00:00:00.0' as timestamp)) < coalesce(h.enddate, now())
  and

/* entered enddate must be greater than record's startdate */
    coalesce(ENDDATE, now()) >= coalesce(h.date, now())