SELECT
  u.DisplayName,
  'u' as type,
  u.FirstName,
  u.LastName

FROM core.users u