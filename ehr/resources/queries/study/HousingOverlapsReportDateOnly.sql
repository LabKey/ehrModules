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

    (
        (cast(COALESCE(STARTDATE, '1900-01-01') AS DATE) >= cast(h.date AS DATE) AND cast(COALESCE(STARTDATE, '1900-01-01') AS DATE) < cast(COALESCE(h.enddate, now()) AS DATE))
            OR
        (cast(COALESCE(ENDDATE, now()) AS DATE) > cast(h.date AS DATE) AND cast(COALESCE(ENDDATE, now()) AS DATE) <= cast(COALESCE(h.enddate, now()) AS DATE))
            OR
        (cast(COALESCE(STARTDATE, '1900-01-01') AS DATE) <= cast(h.date AS DATE) AND cast(COALESCE(ENDDATE, now()) AS DATE) >= cast(COALESCE(h.enddate, now()) AS DATE))
        )