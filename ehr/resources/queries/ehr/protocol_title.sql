SELECT protocol, title , protocol || '-' || coalesce (title,'No Title') as protocolTitle
FROM ehr.protocol