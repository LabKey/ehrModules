/*
 * Copyright (c) 2010-2011 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
e.Id,
CASE WHEN u1.DisplayName is null THEN 'NO' ELSE 'YES' END AS HasUsername,
CASE WHEN u2.email is NULL THEN 'NO' ELSE 'YES' END AS EmailExists,
CASE WHEN (u2.email is NOT NULL AND u1.displayName is not null) THEN 'YES' ELSE 'NO' END AS BothCorrect,

CASE WHEN u3.displayname is NULL THEN 'NO' ELSE 'YES' END AS SOPAccess,

CASE WHEN u4.displayname is NULL THEN 'NO' ELSE 'YES' END AS ColonyAccess



FROM lists.employees e

LEFT JOIN core.users u1
ON (e.id = u1.DisplayName)

LEFT JOIN core.users u2
ON (e.email = u2.email)

LEFT JOIN (
  SELECT u3.userid.displayname as displayname
  from core.members u3
  --TODO: maybe move to a table?
  WHERE groupid.name IN ('wnprcusers (LDAP)', 'wnprcusers (non LDAP)', 'sop access')
  GROUP BY u3.userid.displayname
  ) u3
ON (e.id = u3.displayname)

LEFT JOIN (
  SELECT u4.userid.displayname as displayname
  from core.members u4
  --TODO: maybe move to a table?
  WHERE groupid.name IN ('wnprcusers (LDAP)', 'wnprcusers (non LDAP)')
  GROUP BY u4.userid.displayname
  ) u4
ON (e.id = u4.displayname)