select
    substring(qae.oldrecordmap, charindex('objectid=',qae.oldrecordmap, 0) + len('objectid='), 36) as objectid,
    qae.date as modified

from auditLog.QueryUpdateAuditEvent as qae

WHERE qae.comment = 'A row was deleted.'
  and qae.QueryName = 'LookupSets'
  and qae.SchemaName = 'snd'