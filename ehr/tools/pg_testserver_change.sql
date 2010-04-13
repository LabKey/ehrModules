/*
This script is designed to alter postgres settings on a staging/development server following a full postgres dump from
a production server.  This script comes with no guarantee whatsoever.  Test prior to use.
  
*/

--use labkey;
--'use' doesnt appear supported in postgres
--maybe alternative is \c.  ie: postgres=# \c labkey



--will inactivate all users except site admins and labkey
-- select count(*)
update   core.Principals
SET      Active = FALSE
WHERE type = 'u'   
      AND UserId NOT IN (select p.UserId from core.Principals p inner join core.Members m on (p.UserId = m.UserId and m.GroupId=-1))
      AND Name NOT LIKE '%@labkey.com'
      --AND Name NOT IN ('someuser@myServer.com', 'someOtherUser@myServer.com')
;


UPDATE    prop.Properties p
SET       Value = 'http://test-ehr.primate.wisc.edu:8080'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
	      AND p.Name = 'baseServerURL'
;

UPDATE    prop.Properties p
SET       Value = 'TestServer'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
	      AND p.Name = 'systemShortName'
;

UPDATE    prop.Properties p
SET       Value = 'EHR Test Server'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
	      AND p.Name = 'systemDescription'
;

UPDATE    prop.Properties p
SET       Value = 'Blue'
WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'LookAndFeel'
	      AND p.Name = 'themeName'
;

--not used, but might be of interest
-- UPDATE    prop.Properties p
-- SET       Value = FALSE
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
-- 	        AND p.Name = 'sslRequired'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = '8443'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
-- 	        AND p.Name = 'sslPort'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = 'c:\labkey_data'
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
-- 	        AND p.Name = 'webRoot'
-- ;

-- UPDATE    prop.Properties p
-- SET       Value = TRUE
-- WHERE     (SELECT s.Category FROM prop.PropertySets s WHERE s.Set = p.Set) = 'SiteConfig'
-- 	        AND p.Name = 'adminOnlyMode'
-- ;